import nodemailer from "nodemailer";

export const config = {
  schedule: "*/5 * * * *",
};

const SUPABASE_URL =
  "https://wvbqmuumzbvaxnaajjqo.supabase.co";

const SITE_URL = "https://estichara.ma";
const SUPPORT_EMAIL = "contact@estichara.ma";

export default async function handler() {
  console.log("[email-worker] Execution started");

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  const smtpUser =
    process.env.SMTP_USER;

  const smtpPassword =
    process.env.SMTP_PASSWORD;

  const missingVariables = [];

  if (!key) {
    missingVariables.push(
      "SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  if (!smtpUser) {
    missingVariables.push("SMTP_USER");
  }

  if (!smtpPassword) {
    missingVariables.push("SMTP_PASSWORD");
  }

  if (missingVariables.length > 0) {
    const message =
      `Missing environment variables: ${missingVariables.join(", ")}`;

    console.error(
      `[email-worker] ${message}`,
    );

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
   * Modern Supabase sb_secret_ keys use the apikey header.
   * Legacy eyJ JWT service-role keys also use Authorization.
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
    "?status=eq.pending" +
    "&order=created_at.asc" +
    "&limit=10";

  let rows;

  try {
    const response = await fetch(queueUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const details =
        await response.text();

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
    const message =
      getErrorMessage(error);

    console.error(
      `[email-worker] Could not read email queue: ${message}`,
    );

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

  console.log(
    `[email-worker] Pending emails found: ${rows.length}`,
  );

  if (rows.length === 0) {
    return Response.json({
      success: true,
      processed: 0,
      sent: 0,
      failed: 0,
    });
  }

  const smtpPort =
    Number(process.env.SMTP_PORT || 465);

  const transport =
    nodemailer.createTransport({
      host:
        process.env.SMTP_HOST ||
        "smtp.hostinger.com",

      port: smtpPort,

      secure: smtpPort === 465,

      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },

      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
    });

  try {
    await transport.verify();

    console.log(
      "[email-worker] SMTP connection verified",
    );
  } catch (error) {
    const message =
      getErrorMessage(error);

    console.error(
      `[email-worker] SMTP verification failed: ${message}`,
    );

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
    const nextAttempts =
      Number(row.attempts || 0) + 1;

    try {
      await transport.sendMail({
        from:
          process.env.EMAIL_FROM ||
          `Estichara.ma <${smtpUser}>`,

        to: row.recipient,

        subject: row.subject,

        text: row.body,

        html: buildEmailHtml(
          row.subject,
          row.body,
        ),
      });

      await updateOutboxRow(
        row.id,
        {
          status: "sent",
          sent_at:
            new Date().toISOString(),
          attempts: nextAttempts,
          last_error: "",
        },
        headers,
      );

      sent += 1;

      console.log(
        `[email-worker] Email sent for outbox row ${row.id}`,
      );
    } catch (error) {
      const message =
        getErrorMessage(error)
          .slice(0, 1000);

      const finalStatus =
        nextAttempts >= 5
          ? "failed"
          : "pending";

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

async function updateOutboxRow(
  id,
  body,
  headers,
) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/email_outbox?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const details =
      await response.text();

    throw new Error(
      `Could not update email_outbox (${response.status}): ${details}`,
    );
  }
}

function buildEmailHtml(
  subject,
  body,
) {
  const content =
    parseEmailContent(
      subject,
      body,
    );

  const copy =
    EMAIL_COPY[content.locale];

  const direction =
    content.locale === "ar"
      ? "rtl"
      : "ltr";

  const textAlign =
    content.locale === "ar"
      ? "right"
      : "left";

  const borderSide =
    content.locale === "ar"
      ? "right"
      : "left";

  const logoSpacingSide =
    content.locale === "ar"
      ? "left"
      : "right";

  const localePath =
    content.locale === "ar"
      ? "ar"
      : content.locale === "fr"
        ? "fr"
        : "en";

  const safeQuestionTitle =
    escapeHtml(
      content.questionTitle ||
      copy.fallbackTitle,
    );

  const safeUrl =
    escapeAttribute(content.url);

  const safeSubject =
    escapeHtml(
      subject ||
      copy.heading,
    );

  const year =
    new Date().getUTCFullYear();

  return `<!doctype html>
<html
  lang="${content.locale}"
  dir="${direction}"
>
<head>
  <meta charset="utf-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >

  <meta
    name="color-scheme"
    content="light only"
  >

  <title>${safeSubject}</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background: #f2f7f6;
    color: #173332;
    font-family: Arial, Tahoma, sans-serif;
  "
>
  <div
    style="
      display: none;
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      color: transparent;
    "
  >
    ${escapeHtml(copy.preheader)}
  </div>

  <table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="
      width: 100%;
      background: #f2f7f6;
    "
  >
    <tr>
      <td
        align="center"
        style="padding: 28px 12px;"
      >
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            width: 100%;
            max-width: 620px;
            overflow: hidden;
            background: #ffffff;
            border: 1px solid #dce8e5;
            border-radius: 22px;
            box-shadow: 0 10px 30px rgba(13, 75, 75, 0.08);
          "
        >
          <tr>
            <td
              style="
                height: 7px;
                padding: 0;
                background: #0d4b4b;
                font-size: 0;
                line-height: 0;
              "
            >
              &nbsp;
            </td>
          </tr>

          <tr>
            <td
              dir="${direction}"
              style="
                padding: 28px 32px 20px;
                text-align: ${textAlign};
              "
            >
              <a
                href="${SITE_URL}/${localePath}"
                style="
                  display: inline-block;
                  color: #0d4b4b;
                  text-decoration: none;
                  font-size: 24px;
                  font-weight: 800;
                "
              >
                <span
                  style="
                    display: inline-block;
                    width: 38px;
                    height: 38px;
                    margin-${logoSpacingSide}: 10px;
                    border-radius: 12px;
                    background: #0d4b4b;
                    color: #ffffff;
                    font-size: 20px;
                    line-height: 38px;
                    text-align: center;
                    vertical-align: middle;
                  "
                >
                  E
                </span>

                <span
                  style="
                    vertical-align: middle;
                  "
                >
                  Estichara.ma
                </span>
              </a>
            </td>
          </tr>

          <tr>
            <td
              dir="${direction}"
              style="
                padding: 8px 32px 34px;
                text-align: ${textAlign};
              "
            >
              <div
                style="
                  display: inline-block;
                  padding: 7px 12px;
                  border-radius: 999px;
                  background: #edf7f4;
                  color: #0d6b62;
                  font-size: 12px;
                  font-weight: 700;
                "
              >
                ${escapeHtml(copy.badge)}
              </div>

              <h1
                style="
                  margin: 18px 0 10px;
                  color: #143e3c;
                  font-size: 27px;
                  font-weight: 800;
                  line-height: 1.35;
                "
              >
                ${escapeHtml(copy.heading)}
              </h1>

              <p
                style="
                  margin: 0 0 22px;
                  color: #617472;
                  font-size: 15px;
                  line-height: 1.9;
                "
              >
                ${escapeHtml(copy.intro)}
              </p>

              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  width: 100%;
                  margin: 0 0 26px;
                  border-collapse: separate;
                "
              >
                <tr>
                  <td
                    style="
                      padding: 18px 20px;
                      background: #f7faf9;
                      border-${borderSide}: 4px solid #d2a94b;
                      border-radius: 14px;
                      text-align: ${textAlign};
                    "
                  >
                    <div
                      style="
                        margin-bottom: 6px;
                        color: #83928f;
                        font-size: 11px;
                        font-weight: 700;
                        letter-spacing: 0.7px;
                      "
                    >
                      ${escapeHtml(copy.questionLabel)}
                    </div>

                    <div
                      style="
                        color: #173332;
                        font-size: 16px;
                        font-weight: 700;
                        line-height: 1.7;
                      "
                    >
                      ${safeQuestionTitle}
                    </div>
                  </td>
                </tr>
              </table>

              <table
                role="presentation"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  margin: 0 auto 26px;
                "
              >
                <tr>
                  <td
                    align="center"
                    bgcolor="#0d4b4b"
                    style="
                      border-radius: 12px;
                    "
                  >
                    <a
                      href="${safeUrl}"
                      style="
                        display: inline-block;
                        padding: 15px 28px;
                        border-radius: 12px;
                        color: #ffffff;
                        font-size: 15px;
                        font-weight: 800;
                        line-height: 1;
                        text-decoration: none;
                      "
                    >
                      ${escapeHtml(copy.button)}
                    </a>
                  </td>
                </tr>
              </table>

              <p
                style="
                  margin: 0;
                  padding: 14px 16px;
                  border-radius: 12px;
                  background: #fff9eb;
                  color: #76602d;
                  font-size: 12px;
                  line-height: 1.7;
                  text-align: ${textAlign};
                "
              >
                ${escapeHtml(copy.notice)}
              </p>
            </td>
          </tr>

          <tr>
            <td
              dir="${direction}"
              style="
                padding: 22px 32px;
                background: #f8fbfa;
                border-top: 1px solid #e5eeec;
                text-align: center;
              "
            >
              <p
                style="
                  margin: 0 0 9px;
                  color: #687a77;
                  font-size: 12px;
                  line-height: 1.7;
                "
              >
                ${escapeHtml(copy.reason)}
              </p>

              <p
                style="
                  margin: 0 0 10px;
                  font-size: 12px;
                  line-height: 1.8;
                "
              >
                <a
                  href="mailto:${SUPPORT_EMAIL}"
                  style="
                    color: #0d6b62;
                    text-decoration: none;
                  "
                >
                  ${SUPPORT_EMAIL}
                </a>

                &nbsp;•&nbsp;

                <a
                  href="${SITE_URL}/${localePath}/privacy"
                  style="
                    color: #0d6b62;
                    text-decoration: none;
                  "
                >
                  ${escapeHtml(copy.privacy)}
                </a>

                &nbsp;•&nbsp;

                <a
                  href="${SITE_URL}/${localePath}/terms"
                  style="
                    color: #0d6b62;
                    text-decoration: none;
                  "
                >
                  ${escapeHtml(copy.terms)}
                </a>
              </p>

              <p
                style="
                  margin: 0;
                  color: #98a5a3;
                  font-size: 11px;
                "
              >
                © ${year} Estichara.ma —
                ${escapeHtml(copy.rights)}
              </p>
            </td>
          </tr>
        </table>

        <p
          dir="${direction}"
          style="
            max-width: 620px;
            margin: 14px auto 0;
            color: #9aa8a6;
            font-size: 10px;
            line-height: 1.6;
            text-align: center;
          "
        >
          ${escapeHtml(copy.linkHelp)}

          <br>

          <a
            href="${safeUrl}"
            style="
              color: #78908c;
              word-break: break-all;
            "
          >
            ${safeUrl}
          </a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const EMAIL_COPY = {
  ar: {
    preheader:
      "تمت إضافة إجابة جديدة إلى سؤالك على Estichara.ma.",

    badge:
      "إجابة جديدة",

    heading:
      "وصلت إجابة جديدة إلى سؤالك",

    intro:
      "قام أحد أعضاء مجتمع استشارة بإضافة إجابة. يمكنك الآن فتح السؤال وقراءة الإجابة كاملة.",

    questionLabel:
      "السؤال",

    fallbackTitle:
      "سؤالك على Estichara.ma",

    button:
      "عرض الإجابة",

    notice:
      "راجع الإجابة بعناية، ويمكنك الإبلاغ عن أي محتوى غير مناسب من داخل صفحة السؤال.",

    reason:
      "وصلتك هذه الرسالة لأنك فعّلت إشعارات البريد الإلكتروني لهذا السؤال.",

    privacy:
      "الخصوصية",

    terms:
      "الشروط",

    rights:
      "جميع الحقوق محفوظة",

    linkHelp:
      "إذا لم يعمل الزر، انسخ الرابط التالي وافتحه في متصفحك:",

    prefix:
      "تمت إضافة إجابة جديدة إلى سؤالك:",
  },

  fr: {
    preheader:
      "Une nouvelle réponse a été ajoutée à votre question sur Estichara.ma.",

    badge:
      "Nouvelle réponse",

    heading:
      "Votre question a reçu une nouvelle réponse",

    intro:
      "Un membre de la communauté Estichara a répondu à votre question. Vous pouvez maintenant consulter la réponse complète.",

    questionLabel:
      "Votre question",

    fallbackTitle:
      "Votre question sur Estichara.ma",

    button:
      "Voir la réponse",

    notice:
      "Examinez attentivement la réponse et signalez tout contenu inapproprié depuis la page de la question.",

    reason:
      "Vous recevez cet e-mail parce que vous avez activé les notifications pour cette question.",

    privacy:
      "Confidentialité",

    terms:
      "Conditions",

    rights:
      "Tous droits réservés",

    linkHelp:
      "Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :",

    prefix:
      "Une nouvelle réponse a été ajoutée à votre question :",
  },

  en: {
    preheader:
      "A new answer was added to your question on Estichara.ma.",

    badge:
      "New answer",

    heading:
      "Your question received a new answer",

    intro:
      "A member of the Estichara community answered your question. You can now open the question and read the complete answer.",

    questionLabel:
      "Your question",

    fallbackTitle:
      "Your question on Estichara.ma",

    button:
      "View the answer",

    notice:
      "Review the answer carefully and report inappropriate content from the question page if necessary.",

    reason:
      "You received this email because you enabled email notifications for this question.",

    privacy:
      "Privacy",

    terms:
      "Terms",

    rights:
      "All rights reserved",

    linkHelp:
      "If the button does not work, copy this link into your browser:",

    prefix:
      "A new answer was added to your question:",
  },
};

function parseEmailContent(
  subject,
  body,
) {
  const rawSubject =
    String(subject || "");

  const rawBody =
    String(body || "");

  const urlMatch =
    rawBody.match(
      /https?:\/\/[^\s<>"']+/i,
    );

  const extractedUrl =
    urlMatch?.[0];

  const url =
    isSafeHttpUrl(extractedUrl)
      ? extractedUrl
      : SITE_URL;

  const message =
    rawBody
      .replace(extractedUrl || "", "")
      .trim();

  let locale = "en";

  if (
    /[\u0600-\u06ff]/.test(
      rawSubject + rawBody,
    )
  ) {
    locale = "ar";
  } else if (
    /nouvelle réponse/i.test(
      rawSubject + rawBody,
    ) ||
    /\/fr\//i.test(url)
  ) {
    locale = "fr";
  }

  const prefix =
    EMAIL_COPY[locale].prefix;

  const questionTitle =
    message.startsWith(prefix)
      ? message
          .slice(prefix.length)
          .trim()
      : message;

  return {
    locale,
    url,
    questionTitle,
  };
}

function isSafeHttpUrl(value) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" ||
      url.protocol === "http:"
    );
  } catch {
    return false;
  }
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

function escapeAttribute(value) {
  return escapeHtml(value).replace(
    /`/g,
    "&#96;",
  );
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : String(error);
}
