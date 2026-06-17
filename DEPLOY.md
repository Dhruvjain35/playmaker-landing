# Deploying to playmakr.pro

The site is **live now** on GitHub Pages:
**https://dhruvjain35.github.io/playmaker-landing/**

To move it onto the `playmakr.pro` apex domain, the **domain owner (Harshi)** must add the
DNS records below in whatever manages `playmakr.pro`'s zone (currently Hostinger). Nothing on
the live domain changes until they do — and our GitHub Pages URL keeps working throughout.

## Step 1 — Owner adds these DNS records

| Type  | Host / Name | Value                  |
|-------|-------------|------------------------|
| A     | `@`         | `185.199.108.153`      |
| A     | `@`         | `185.199.109.153`      |
| A     | `@`         | `185.199.110.153`      |
| A     | `@`         | `185.199.111.153`      |
| CNAME | `www`       | `dhruvjain35.github.io.`|

> If Hostinger only allows editing DNS when the domain uses Hostinger's own DNS (not the
> `dns-parking.com` nameservers), switch the domain to "Hostinger DNS / managed DNS" first,
> then add the records above. Remove any existing `A @` records that point at Hostinger
> hosting (`92.112.x` / `147.79.x`) so they don't conflict.

## Step 2 — We attach the domain (after DNS is live)

Once the records resolve, the maintainer of this repo runs:

```bash
# add CNAME so Pages claims the domain
echo "playmakr.pro" > CNAME && git add CNAME && git commit -m "Add custom domain" && git push

# point Pages at the apex domain + enforce HTTPS
gh api -X PUT repos/Dhruvjain35/playmaker-landing/pages -f "cname=playmakr.pro" -F "https_enforced=true"
```

DNS propagation is usually minutes, occasionally up to a few hours. GitHub then issues a
free TLS cert automatically.

## Message to send the domain owner

> Hey — I've got the new PLAYMAKR landing page built and live here:
> https://dhruvjain35.github.io/playmaker-landing/
> To put it on playmakr.pro, can you add these DNS records in Hostinger:
> A  @  185.199.108.153 / .109.153 / .110.153 / .111.153
> CNAME  www  dhruvjain35.github.io
> (and remove the old A records pointing at Hostinger hosting). Ping me once it's saved and
> I'll flip it live with HTTPS.
