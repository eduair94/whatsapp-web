export default defineEventHandler(async (event) => {
  // Get the returnTo query parameter
  const query = getQuery(event);
  const returnTo = query.returnTo as string;

  // Get the referer URL from the request
  const referer = getHeader(event, "referer");

  // Get the origin/host from the request as fallback
  const host = getHeader(event, "host");
  const protocol = getHeader(event, "x-forwarded-proto") || "https";
  const origin = `${protocol}://${host}`;

  // Use returnTo if provided, then referer if available, otherwise fallback to root
  const backUrl = returnTo || referer || origin + "/";

  // Set content type to HTML
  setHeader(event, "content-type", "text/html");

  // Return HTML page with go back button
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Refresh - WhatsApp Profile API</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #333;
            }
            .container {
                text-align: center;
                background: white;
                padding: 3rem;
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                max-width: 500px;
                margin: 2rem;
            }
            h1 {
                color: #2c3e50;
                margin-bottom: 1rem;
                font-size: 2rem;
            }
            p {
                color: #7f8c8d;
                margin-bottom: 2rem;
                font-size: 1.1rem;
                line-height: 1.6;
            }
            .btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: 8px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-block;
                margin: 0.5rem;
            }
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
            }
            .btn-secondary {
                background: #95a5a6;
            }
            .btn-secondary:hover {
                background: #7f8c8d;
                box-shadow: 0 8px 25px rgba(149, 165, 166, 0.3);
            }
            .icon {
                margin-right: 0.5rem;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔄 Page Refreshed</h1>
            <p>The page has been refreshed successfully. You can now go back to continue browsing.</p>
            
            <a href="${backUrl}" class="btn">
                <span class="icon">←</span>
                Go Back to Previous Page
            </a>
            
            <br>
            
            <a href="${origin}/" class="btn btn-secondary">
                <span class="icon">🏠</span>
                Go to Home Page
            </a>
        </div>

        <script>
            window.location.replace('${backUrl}');
        </script>
    </body>
    </html>
  `;
});
