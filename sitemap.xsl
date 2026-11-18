<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="vi">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>Sitemap — Open IPTV Pro Web</title>
        <style>
          *{box-sizing:border-box}
          body{margin:0;background:#0d1520;color:#edf5ff;font:16px/1.6 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
          main{max-width:900px;margin:50px auto;padding:0 22px}
          h1{font-size:clamp(26px,5vw,38px);line-height:1.2;margin:0 0 12px}
          p{color:#a9bbce}
          .count{display:inline-block;border:1px solid #35624f;background:#163629;color:#a3f3c4;padding:5px 12px;border-radius:30px;font-weight:650;margin-bottom:16px}
          .items{margin-top:24px;display:grid;gap:12px}
          .item{display:flex;gap:16px;align-items:flex-start;padding:19px;border-radius:14px;border:1px solid #2f4053;background:#142031}
          .num{flex:0 0 36px;text-align:center;padding:4px 0;border-radius:9px;background:#254334;color:#a9f4cc;font-weight:750}
          .label{color:#bbcddd;font-size:13px;margin-bottom:4px}
          a{color:#82caff;overflow-wrap:anywhere;text-decoration:underline;text-underline-offset:3px}
          footer{margin-top:28px;font-size:13px;color:#9eb0c3}
        </style>
      </head>
      <body>
        <main>
          <h1>Sitemap · Open IPTV Pro</h1>
          <p>Danh sách các trang công khai của website để công cụ tìm kiếm thu thập dữ liệu.</p>
          <div class="count"><xsl:value-of select="count(sm:urlset/sm:url)"/> đường dẫn (URL)</div>
          <div class="items">
            <xsl:for-each select="sm:urlset/sm:url">
              <div class="item">
                <div class="num"><xsl:value-of select="position()"/></div>
                <div>
                  <div class="label"><xsl:choose><xsl:when test="position()=1">Trang ứng dụng Web</xsl:when><xsl:otherwise>Trang hướng dẫn</xsl:otherwise></xsl:choose></div>
                  <a href="{sm:loc}"><xsl:value-of select="sm:loc"/></a>
                </div>
              </div>
            </xsl:for-each>
          </div>
          <footer>Đây là sitemap XML chuẩn. Trang hiển thị này chỉ hỗ trợ người đọc; Google sử dụng các thẻ URL trong tệp XML.</footer>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
