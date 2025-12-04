self.__BUILD_MANIFEST = {
  "/dashboard": [
    "static/chunks/pages/dashboard.js"
  ],
  "/dashboard/transactions": [
    "static/chunks/pages/dashboard/transactions.js"
  ],
  "__rewrites": {
    "afterFiles": [],
    "beforeFiles": [],
    "fallback": []
  },
  "sortedPages": [
    "/",
    "/_app",
    "/_error",
    "/api/auth/register",
    "/api/auth/[...nextauth]",
    "/dashboard",
    "/dashboard/alerts",
    "/dashboard/reports",
    "/dashboard/settings",
    "/dashboard/transactions",
    "/login",
    "/register"
  ]
};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()