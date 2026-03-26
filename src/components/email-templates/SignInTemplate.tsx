interface SignInTemplateProps {
  url: string;
}

export const SignInTemplate = ({ url }: SignInTemplateProps) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Sign in to TuneHunter</title>
    </head>
    <body style={{ margin: 0, padding: 0, backgroundColor: "#162455" }}>
      {/* Outer wrapper — background must be on <td>, not <table>, for Gmail */}
      <table width="100%" cellPadding={0} cellSpacing={0}>
        <tbody>
          <tr>
            <td align="center" style={{ backgroundColor: "#162455", padding: "48px 16px" }}>
              <table cellPadding={0} cellSpacing={0} style={{ maxWidth: 540, width: "100%" }}>
                <tbody>
                  {/* ── Header ── */}
                  <tr>
                    <td
                      style={{
                        background:
                          "linear-gradient(135deg, #c75cb0 0%, #e779c1 55%, #a87de8 100%)",
                        borderRadius: "20px 20px 0 0",
                        padding: "36px 44px 32px",
                        textAlign: "center" as const,
                      }}
                    >
                      {/* Icon circle */}
                      <div
                        style={{
                          display: "inline-block",
                          width: 56,
                          height: 56,
                          lineHeight: "56px",
                          borderRadius: "50%",
                          backgroundColor: "rgba(255,255,255,0.18)",
                          fontSize: 26,
                          textAlign: "center" as const,
                          marginBottom: 14,
                        }}
                      >
                        🎧
                      </div>
                      <br />
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase" as const,
                          color: "rgba(255,255,255,0.75)",
                          fontFamily: "Arial, sans-serif",
                        }}
                      >
                        TuneHunter
                      </span>
                    </td>
                  </tr>

                  {/* ── Cyan accent bar ── */}
                  <tr>
                    <td style={{ height: 4, backgroundColor: "#58C7F3" }} />
                  </tr>

                  {/* ── Body ── */}
                  <tr>
                    <td
                      style={{
                        backgroundColor: "#0D1840",
                        padding: "40px 44px 36px",
                        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 6px",
                          fontSize: 26,
                          fontWeight: 800,
                          color: "#F7F9FD",
                          letterSpacing: "-0.5px",
                        }}
                      >
                        Welcome back
                      </p>
                      <p
                        style={{
                          margin: "0 0 32px",
                          fontSize: 15,
                          color: "rgba(247,249,253,0.55)",
                          lineHeight: 1.65,
                        }}
                      >
                        Click the button below to sign in to your TuneHunter account. This link
                        expires in&nbsp;10&nbsp;minutes.
                      </p>

                      {/* CTA button */}
                      <table cellPadding={0} cellSpacing={0} style={{ marginBottom: 36 }}>
                        <tbody>
                          <tr>
                            <td
                              style={{
                                borderRadius: 12,
                                backgroundColor: "#E779C1",
                              }}
                            >
                              <a
                                href={url}
                                style={{
                                  display: "inline-block",
                                  padding: "15px 40px",
                                  fontSize: 16,
                                  fontWeight: 700,
                                  color: "#0D1840",
                                  textDecoration: "none",
                                  borderRadius: 12,
                                  letterSpacing: "-0.2px",
                                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                                }}
                              >
                                Sign in to TuneHunter →
                              </a>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Divider */}
                      <table
                        width="100%"
                        cellPadding={0}
                        cellSpacing={0}
                        style={{ marginBottom: 24 }}
                      >
                        <tbody>
                          <tr>
                            <td
                              style={{
                                borderTop: "1px solid rgba(88,199,243,0.18)",
                              }}
                            />
                          </tr>
                        </tbody>
                      </table>

                      {/* Fallback URL */}
                      <p
                        style={{
                          margin: "0 0 4px",
                          fontSize: 12,
                          color: "rgba(247,249,253,0.35)",
                          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                        }}
                      >
                        Button not working? Paste this link into your browser:
                      </p>
                      <p
                        style={{
                          margin: "0 0 28px",
                          fontSize: 12,
                          color: "#58C7F3",
                          wordBreak: "break-all" as const,
                          lineHeight: 1.6,
                          fontFamily: "monospace",
                        }}
                      >
                        {url}
                      </p>

                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          color: "rgba(247,249,253,0.35)",
                          lineHeight: 1.65,
                          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                        }}
                      >
                        If you didn&apos;t request this sign-in link, you can safely ignore this
                        email.
                      </p>
                    </td>
                  </tr>

                  {/* ── Footer ── */}
                  <tr>
                    <td
                      align="center"
                      style={{
                        backgroundColor: "#0A1030",
                        borderRadius: "0 0 20px 20px",
                        padding: "20px 44px",
                        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color: "rgba(247,249,253,0.28)",
                          letterSpacing: "0.02em",
                        }}
                      >
                        © {new Date().getFullYear()} TuneHunter &nbsp;·&nbsp; Find the music you
                        love
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
