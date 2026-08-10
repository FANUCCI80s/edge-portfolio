export function loginOtpEmail(
  firstName: string,
  code: string
) {
  return {
    subject: "Your Edge Portfolio verification code",

    text: `Hello ${firstName},

Your Edge Portfolio verification code is:

${code}

This code expires in 10 minutes.

If you did not attempt to sign in, please secure your account immediately.

Edge Portfolio`,

    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Edge Portfolio Verification</title>
        </head>

        <body
          style="
            margin: 0;
            padding: 0;
            background: #0a0a0a;
            font-family: Arial, Helvetica, sans-serif;
          "
        >
          <div
            style="
              max-width: 600px;
              margin: 40px auto;
              padding: 40px 24px;
              background: #111111;
              color: #ffffff;
            "
          >
            <h1
              style="
                margin: 0 0 24px;
                font-size: 28px;
              "
            >
              Edge Portfolio
            </h1>

            <p
              style="
                color: #cccccc;
                font-size: 16px;
                line-height: 1.6;
              "
            >
              Hello ${firstName},
            </p>

            <p
              style="
                color: #cccccc;
                font-size: 16px;
                line-height: 1.6;
              "
            >
              Use the verification code below to
              complete your sign-in.
            </p>

            <div
              style="
                margin: 30px 0;
                padding: 20px;
                background: #181818;
                border-radius: 12px;
                text-align: center;
                letter-spacing: 8px;
                font-size: 32px;
                font-weight: bold;
              "
            >
              ${code}
            </div>

            <p
              style="
                color: #999999;
                font-size: 14px;
                line-height: 1.6;
              "
            >
              This verification code expires in
              10 minutes.
            </p>

            <p
              style="
                color: #999999;
                font-size: 14px;
                line-height: 1.6;
              "
            >
              If you did not attempt to sign in,
              please secure your account immediately.
            </p>

            <hr
              style="
                border: 0;
                border-top: 1px solid #292929;
                margin: 30px 0;
              "
            />

            <p
              style="
                color: #666666;
                font-size: 12px;
              "
            >
              Edge Portfolio
            </p>
          </div>
        </body>
      </html>
    `,
  };
}