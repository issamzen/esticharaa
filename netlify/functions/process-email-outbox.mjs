import nodemailer from "nodemailer";

export const config = {
  schedule: "*/5 * * * *",
};

const SUPABASE_URL = "https://wvbqmuumzbvaxnaajjqo.supabase.co";

export default async function handler() {
  console.log("[email-worker] Execution started");

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  const missingVariables = [];

  if (!key) missingVariables.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!user) missingVariables.push("SMTP_USER");
  if (!pass) missingVariables.push("SMTP_PASSWORD");

  if (missingVariables.length > 0) {
    const message = `Missing environment variables: ${missingVariables.join(", ")}`;
    console.error(`[email-worker] ${message}`);

    return Response.json(
      {
        success: false,
        error: message,
      },
      {
        status: 503,
      },
    );
  }

  /*
   * Modern sb_secret_ keys must be sent using the apikey header.
   * Legacy eyJ JWT service-role keys also use Authorization: Bearer.
   */
  const headers = {
    apikey: key,
    "Content-Type": "application/json",
  };

  if (key.startsWith("eyJ")) {
    headers.Authorization = `Bearer ${key}`;
  }

  const queueUrl =
    `${SUPABASE_URL}/rest/v1/email_outbox` +
    "?status=eq.pending&order=created_at.asc&limit=10";

  let rows;

  try {
    const response = await fetch(queueUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const details = await response.text();

      console.error(
        `[email-worker] Supabase queue request failed with status ${response.status}: ${details}`,
      );

      return Response.json(
        {
          success: false,
          stage: "read_queue",
          status: response.status,
          error: details,
        },
        {
          status: 500,
        },
      );
    }

    rows = await response.json();
  } catch (error) {
    const message = getErrorMessage(error);

    console.error(`[email-worker] Could not read email queue: ${message}`);

    return Response.json(
      {
        success: false,
        stage: "read_queue",
        error: message,
      },
      {
        status: 500,
      },
    );
  }

  console.log(`[email-worker] Pending emails found: ${rows.length}`);

  if (rows.length === 0) {
    return Response.json({
      success: true,
      processed: 0,
      sent: 0,
      failed: 0,
    });
  }

  const port = Number(process.env.SMTP_PORT || 465);

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
  });

  try {
    await transport.verify();
    console.log("[email-worker] SMTP connection verified");
  } catch (error) {
    const message = getErrorMessage(error);

    console.error(`[email-worker] SMTP verification failed: ${message}`);

    return Response.json(
      {
        success: false,
        stage: "smtp_verification",
        processed: 0,
        sent: 0,
        error: message,
      },
      {
        status: 500,
      },
    );
  }

  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    const nextAttempts = Number(row.attempts || 0) + 1;

    try {
      await transport.sendMail({
        from:
          process.env.EMAIL_FROM ||
          `Estichara.ma <${user}>`,
        to: row.recipient,
        subject: row.subject,
        text: row.body,
        html: buildEmailHtml(row.body),
      });

      await updateOutboxRow(
        row.id,
        {
          status: "sent",
          sent_at: new Date().toISOString(),
          attempts: nextAttempts,
          last_error: "",
        },
        headers,
      );

      sent += 1;
      console.log(`[email-worker] Email sent for outbox row ${row.id}`);
    } catch (error) {
      const message = getErrorMessage(error).slice(0, 1000);
      const finalStatus = nextAttempts >= 5 ? "failed" : "pending";

      console.error(
        `[email-worker] Failed outbox row ${row.id}: ${message}`,
      );

      try {
        await updateOutboxRow(
          row.id,
          {
            status: finalStatus,
            attempts: nextAttempts,
            last_error: message,
          },
          headers,
        );
      } catch (updateError) {
        console.error(
          `[email-worker] Could not update failed outbox row ${row.id}: ${getErrorMessage(updateError)}`,
        );
      }

      failed += 1;
    }
  }

  transport.close();

  console.log(
    `[email-worker] Finished. Processed: ${rows.length}, sent: ${sent}, failed: ${failed}`,
  );

  return Response.json({
    success: true,
    processed: rows.length,
    sent,
    failed,
  });
}

async function updateOutboxRow(id, body, headers) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/email_outbox?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const details = await response.text();

    throw new Error(
      `Could not update email_outbox (${response.status}): ${details}`,
    );
  }
}

function buildEmailHtml(body) {
  const safeBody = escapeHtml(body).replace(/\n/g, "<br>");

  return `
    <div
      style="
        font-family: Arial, sans-serif;
        line-height: 1.7;
        max-width: 640px;
        margin: auto;
        color: #1f2937;
      "
    >
      <h2 style="color: #0D4B4B; margin-bottom: 20px;">
        Estichara.ma
      </h2>

      <p>${safeBody}</p>

      <hr
        style="
          border: 0;
          border-top: 1px solid #eeeeee;
          margin: 24px 0;
        "
      >

      <p style="font-size: 12px; color: #777777;">
        You received this service email because you enabled answer
        notifications for your question.
      </p>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character],
  );
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
