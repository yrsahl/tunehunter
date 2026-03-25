interface EmailTemplateProps {
  verificationCode: string;
}

export const VerificationTokenTemplate = ({ verificationCode }: EmailTemplateProps) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Your TuneHunter verification code</title>
    </head>
    <body
      style={{
        margin: 0,
        padding: 0,
        backgroundColor: "#F0D8EA",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <table
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        style={{ backgroundColor: "#F0D8EA", padding: "40px 16px" }}
      >
        <tbody>
          <tr>
            <td align="center">
              <table
                width="520"
                cellPadding={0}
                cellSpacing={0}
                style={{ maxWidth: "520px", width: "100%" }}
              >
                {/* Header */}
                <tbody>
                  <tr>
                    <td
                      align="center"
                      style={{
                        backgroundColor: "#E96D7B",
                        borderRadius: "16px 16px 0 0",
                        padding: "32px 40px 28px",
                      }}
                    >
                      <table cellPadding={0} cellSpacing={0}>
                        <tbody>
                          <tr>
                            <td align="center">
                              {/* Logo mark */}
                              <div
                                style={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: "50%",
                                  backgroundColor: "rgba(255,255,255,0.2)",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  marginBottom: 12,
                                  fontSize: 24,
                                  lineHeight: "48px",
                                  textAlign: "center",
                                }}
                              >
                                🎧
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td align="center">
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 22,
                                  fontWeight: 700,
                                  color: "#ffffff",
                                  letterSpacing: "-0.3px",
                                }}
                              >
                                TuneHunter
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* Body */}
                  <tr>
                    <td
                      style={{
                        backgroundColor: "#ffffff",
                        padding: "36px 40px 32px",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 8px",
                          fontSize: 24,
                          fontWeight: 700,
                          color: "#62313F",
                          letterSpacing: "-0.4px",
                        }}
                      >
                        Your sign-in code
                      </p>
                      <p
                        style={{
                          margin: "0 0 28px",
                          fontSize: 15,
                          color: "#8B5A66",
                          lineHeight: 1.6,
                        }}
                      >
                        Use the code below to sign in to TuneHunter. It expires
                        shortly, so grab it while it&apos;s fresh.
                      </p>

                      {/* Code box */}
                      <table
                        width="100%"
                        cellPadding={0}
                        cellSpacing={0}
                        style={{ marginBottom: 28 }}
                      >
                        <tbody>
                          <tr>
                            <td
                              align="center"
                              style={{
                                backgroundColor: "#F0D8EA",
                                borderRadius: 12,
                                padding: "20px 24px",
                                border: "2px solid #E96D7B",
                              }}
                            >
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 36,
                                  fontWeight: 800,
                                  letterSpacing: "8px",
                                  color: "#E96D7B",
                                  fontFamily: "monospace",
                                }}
                              >
                                {verificationCode}
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          color: "#B08090",
                          lineHeight: 1.6,
                        }}
                      >
                        If you didn&apos;t request this code, you can safely
                        ignore this email. Someone may have entered your email
                        address by mistake.
                      </p>
                    </td>
                  </tr>

                  {/* Footer */}
                  <tr>
                    <td
                      align="center"
                      style={{
                        backgroundColor: "#62313F",
                        borderRadius: "0 0 16px 16px",
                        padding: "20px 40px",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color: "rgba(255,255,255,0.55)",
                          lineHeight: 1.6,
                        }}
                      >
                        © {new Date().getFullYear()} TuneHunter &nbsp;·&nbsp;
                        Find the music you love
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
  </html>
);
