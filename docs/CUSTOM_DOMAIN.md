# hacktheparadise.com

Keep the existing GitHub Actions deployment to GitHub Pages. Cloudflare can manage DNS without moving the hosting. The Vite relative base and hash routes already support the custom domain.

## Activate the domain

1. In GitHub repository `tejeshrouniar/StoriCode`, open Settings > Pages. Keep Source set to GitHub Actions. Set Custom domain to `hacktheparadise.com` and save. With this custom Actions deployment, a CNAME file alone does not configure the Pages domain.
2. At the authoritative DNS provider, configure the records below. Replace conflicting website records for these names; preserve email MX/TXT and unrelated records. If using Cloudflare, use DNS only (gray cloud) during setup.

| Type | Name | Target |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | tejeshrouniar.github.io |

3. After GitHub's DNS check and certificate issuance finish, enable Enforce HTTPS in Pages settings.
4. In Supabase Authentication > URL Configuration, set Site URL to `https://hacktheparadise.com` and add `https://hacktheparadise.com/` and `https://www.hacktheparadise.com/` to Redirect URLs. Retain localhost entries for development.
5. The Google OAuth authorized redirect URI remains `https://qlptlxzrnvrahanlordb.supabase.co/auth/v1/callback`. If Google authorized JavaScript origins are configured, add `https://hacktheparadise.com` and `https://www.hacktheparadise.com`.

## Verify after activation

Check apex and www resolve to GitHub Pages, HTTPS succeeds, chapter assets and narration load, and Google sign-in returns to the new domain. Guest saves belong to the old browser origin and do not transfer automatically; account progress remains in Supabase. Local code checks cannot prove DNS, certificate issuance, or OAuth settings are correct.

Configuration status: these are setup instructions, not confirmation that the hosted settings have been applied.

Reference: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
