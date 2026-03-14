import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
    // Matches all paths EXCEPT:
    //  - the exact root "/" (so our landing page at app/page.tsx is served directly)
    //  - api routes, Next.js internals, static files
    matcher: ["/((?!$|api|_next|_vercel|.*\\..*).*)" ],
};
