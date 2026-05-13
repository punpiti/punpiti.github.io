# Punpiti Piamsa-nga Website

เว็บไซต์ส่วนตัวของ รศ.ดร.พันธุ์ปิติ เปี่ยมสง่า สำหรับรวบรวมข้อมูลงานวิชาการ งานวิจัย งานสอน บทความ แอปพลิเคชัน และลิงก์ระบบที่เกี่ยวข้องกับงานด้าน Computer Engineering, Applied AI, Talent Development และ University Systems

เว็บไซต์นี้เป็น static website สามารถโฮสต์ด้วย GitHub Pages ได้โดยตรง ไม่ต้องมีขั้นตอน build

## เว็บไซต์

- หน้าหลัก: `index.html`
- หน้าอังกฤษ: `index-en.html`
- โปรไฟล์: `profile.html`
- ผลงานวิจัย: `publications.html`
- งานสอน: `classes.html`
- บทความ: `articles.html`
- แอปและเว็บทดลอง: `apps.html`

## เมนูหลักทำอะไร

เมนูหลักใน header ของเว็บประกอบด้วย `About me`, `Profile`, `Publications`, `Classes`, `Articles` และ `Apps` โดยแต่ละหน้าเป็น HTML แยกไฟล์ และใช้ CSS/JavaScript กลางจาก `assets/`

### About me

ไฟล์หลักคือ `index.html` และมีหน้าอังกฤษคือ `index-en.html`

หน้านี้ทำหน้าที่เป็นหน้าแรกของเว็บ แนะนำตัว งานหลัก ช่องทางติดต่อ และทางเข้าไปยังส่วนสำคัญของเว็บ เช่น publications, profile, articles, talent development และ apps

วิธีทำงาน:

- เนื้อหาหลักเขียนอยู่ใน HTML โดยตรง
- ใช้ `assets/site.css` สำหรับ layout, typography, navigation, card และ responsive style
- ใช้ `assets/site-shell.js` เพื่อ normalize ชื่อเว็บและ subtitle ใน brand area
- มี metadata สำหรับ SEO, canonical URL, Open Graph และ Twitter card
- มี language switch เชื่อมระหว่าง `index.html` และ `index-en.html`

### Profile

ไฟล์หลักคือ `profile.html`

หน้านี้แสดงข้อมูล profile จาก KU Urban เช่น รูป ชื่อ ตำแหน่ง หน่วยงาน อีเมล ประวัติงานบริหาร การศึกษา research interests, personal insights และ profile links

วิธีทำงาน:

- HTML วางโครงหน้าและ placeholder ด้วย `data-*` attributes เช่น `data-urban-profile-card`, `data-profile-education`, `data-profile-interests`
- `assets/urban-profile.js` fetch ข้อมูล JSON จาก KU Urban API
- เมื่อโหลดข้อมูลสำเร็จ JavaScript จะ render ข้อมูลลงใน DOM
- ถ้าโหลด API ไม่สำเร็จ จะแสดงข้อความ error ในพื้นที่ profile
- สามารถ override API ได้ด้วย query string เช่น `profile.html?api=local` หรือ `profile.html?api=<url>`

### Publications

ไฟล์หลักคือ `publications.html`

หน้านี้แสดง publication profile, สถิติผลงาน, research signals, รายการผลงานตีพิมพ์ และโครงการวิจัยล่าสุด โดยอ้างอิงข้อมูลจาก KU Urban และ KU Forest

วิธีทำงาน:

- HTML วางโครงหน้า hero, stat cards, analysis section, search/filter tools, publication list และ project grid
- `assets/publications.js` fetch ข้อมูลจาก KU Urban API
- JavaScript แยกข้อมูลเป็น outputs และ projects แล้ว sort ตามปี/เดือน
- มีช่องค้นหาผลงานจากชื่อเรื่อง วารสาร ผู้เขียน ปี DOI และ metadata อื่น
- มี filter ตามประเภทหรือระดับ เช่น `Journal`, `Conference`, `International`, `Q1`
- รายการ publication แสดงแบบแบ่งหน้าโดยใช้ปุ่ม `แสดงเพิ่มเติม`
- หากมี DOI หรือ KU Forest URL ระบบจะแสดงลิงก์ออกไปยังแหล่งข้อมูลนั้น

### Classes

ไฟล์หลักคือ `classes.html`

หน้านี้แยกข้อมูลงานสอนออกจาก profile โดยแสดงรายวิชาปัจจุบันและ teaching history

วิธีทำงาน:

- รายวิชาปัจจุบันภาคต้น 2569 เขียนอยู่ใน HTML โดยตรง
- teaching history โหลดจาก KU Urban API ผ่าน `assets/urban-profile.js`
- JavaScript อ่าน `profile.teaching_summary` แล้วแปลงเป็นรายการรายวิชา
- มีการดึงจำนวนครั้งที่เคยสอนและปีล่าสุดจากข้อความ summary เพื่อแสดง metadata ของแต่ละวิชา
- หาก API โหลดไม่ได้ จะแสดงสถานะว่าไม่สามารถโหลดข้อมูลได้

### Articles

ไฟล์หลักคือ `articles.html`

หน้านี้เป็นหน้ารวมบทความและข้อเขียนทั้งหมด โดยเชื่อมไปยังไฟล์บทความในโฟลเดอร์ `articles/`

วิธีทำงาน:

- ข้อมูลรายการบทความอยู่ใน `assets/articles-data.js` ภายใต้ `window.ARTICLES_DATA`
- `assets/me-articles.js` render รายการบทความลงใน `#article-list`
- ค้นหาได้จากชื่อเรื่อง สรุป หมวด และ tag
- รองรับการกรองด้วย query string เช่น `articles.html?tag=ai`, `articles.html?tag=talent-development`, `articles.html?tag=higher-education`
- แต่ละบทความเป็น static HTML แยกไฟล์ใน `articles/`

### Apps

ไฟล์หลักคือ `apps.html`

หน้านี้รวมลิงก์ไปยังแอป ระบบ และเว็บทดลองที่เกี่ยวข้องกับงาน เช่น KU Urban Decision Intelligence, KU Forest, KU Work และ campaign archive

วิธีทำงาน:

- เนื้อหาเป็น static HTML card links
- ใช้ style กลางจาก `assets/site.css`
- ใช้ `assets/site-shell.js` สำหรับ brand text
- ไม่มีการ fetch API ในหน้านี้

## หน้าเสริมและหน้าเก่า

นอกจากเมนูหลัก ยังมีไฟล์ HTML อื่น เช่น `research.html`, `teaching.html`, `university-systems.html` และ `about.html`

- `about.html` เป็น redirect ไป `index.html`
- `research.html`, `teaching.html` และ `university-systems.html` เป็นหน้าเนื้อหาเฉพาะทางหรือหน้าเก่าที่ยังอยู่ใน repository แต่ไม่ได้อยู่ในเมนูหลักปัจจุบัน
- หากต้องการนำหน้าเหล่านี้กลับเข้าเมนูหลัก ควรเพิ่มลิงก์ใน header ของทุกหน้าหลักให้สอดคล้องกัน

## Data sources

เว็บนี้ใช้ทั้งข้อมูลที่เขียนอยู่ใน repository โดยตรง และข้อมูลที่โหลดจากระบบภายนอกตอนเปิดหน้าเว็บ

### KU Urban web pages

หน้าเว็บต้นฉบับที่เปิดดูได้ใน browser:

```text
https://urban.cpe.ku.ac.th/
```

หน้าค้นหาข้อมูลของ รศ.ดร.พันธุ์ปิติ เปี่ยมสง่า บน KU Urban:

```text
https://urban.cpe.ku.ac.th/?q=พันธุ์ปิติ%20เปี่ยมสง่า
```

ใช้โดย:

- `apps.html` ลิงก์ไปหน้าแรกของ KU Urban Decision Intelligence
- `research.html` ลิงก์ไปหน้าผลค้นหาชื่อบุคคลบน KU Urban
- `profile.html`, `classes.html` และ `publications.html` ใช้ข้อมูลจาก KU Urban API เพื่อนำข้อมูลเดียวกันมาแสดงในเว็บนี้ในรูปแบบที่อ่านง่ายขึ้น

หมายเหตุ: หน้าเว็บต้นฉบับบน KU Urban มีไว้สำหรับตรวจสอบข้อมูลจากระบบต้นทาง ส่วน API endpoint ด้านล่างเป็นแหล่งข้อมูลที่ JavaScript ของเว็บนี้ fetch มา render ในแต่ละหน้า

### KU Urban API

แหล่งข้อมูล dynamic หลักของหน้า `profile.html`, `classes.html` และ `publications.html`

endpoint หลัก:

```text
https://urban.cpe.ku.ac.th/api/profile-claims/stream/360009?token=...
```

ใช้โดย:

- `assets/urban-profile.js` สำหรับ `profile.html` และ `classes.html`
- `assets/publications.js` สำหรับ `publications.html`

ข้อมูลที่ใช้จาก API:

- `profile.data` หรือ `person.data`: ชื่อ ตำแหน่ง หน่วยงาน รูปภาพ อีเมล เบอร์โทร ความสนใจ ประวัติการศึกษา teaching summary และ profile URL
- `outputs.data`: รายการผลงานตีพิมพ์ ใช้แสดง publication list, DOI, KU Forest link, authors, source, year, output type, class level และ formula tier
- `projects` หรือ `projects.data`: รายการโครงการวิจัยล่าสุด ใช้แสดง project cards
- `analysis`: สรุปเชิงวิเคราะห์ สถิติผลงาน topics/concepts และข้อมูล OpenAlex ถ้ามี
- `public_profile_context`: ใช้แสดง personal insights ในหน้า Profile ถ้ามีข้อมูล

วิธีเลือก API URL:

- บน production หรือ GitHub Pages จะใช้ `https://urban.cpe.ku.ac.th/...`
- ถ้าเปิดจาก `localhost`, `127.0.0.1` หรือ `0.0.0.0` ใน `publications.html` จะใช้ local API ที่ `http://127.0.0.1:8000/...`
- ใน `profile.html` และ `classes.html` สามารถใช้ `?api=local` เพื่อบังคับ local API
- ทุกหน้าที่ใช้ API สามารถ override endpoint ด้วย `?api=<url>` เพื่อทดสอบกับ data source อื่นได้

ตัวอย่าง:

```text
profile.html?api=local
publications.html?api=https://example.com/profile.json
```

### KU Forest

ใช้เป็นแหล่งอ้างอิง profile งานวิจัยและผลงานตีพิมพ์

URL หลัก:

```text
https://research.ku.ac.th/forest/Person.aspx?id=360009
```

ใช้โดย:

- `publications.html` มีปุ่มเปิด KU Forest profile
- `assets/publications.js` แสดงลิงก์ `KU Forest` ของแต่ละ publication/project เมื่อ API ส่ง `profile_url` หรือ `forestUrl` มา
- `profile.html` แสดง profile link ถ้า KU Urban API ส่ง `profile.profile_url` มา

### OpenAlex

ไม่ได้ fetch ตรงจากหน้าเว็บนี้ แต่ใช้ข้อมูล OpenAlex ที่ถูกส่งมากับ `analysis.openalex` จาก KU Urban API

ใช้โดย:

- `publications.html` ในส่วน `Research Signals`
- `profile.html` ในส่วน `Profile Links`

ข้อมูลที่แสดง เช่น works count, citations, OpenAlex h-index, i10-index, topics และ concepts

### Article registry

บทความไม่ได้โหลดจาก API ภายนอก แต่ใช้ข้อมูล local ใน repository

ไฟล์หลัก:

```text
assets/articles-data.js
```

ไฟล์นี้ประกาศ `window.ARTICLES_DATA` ซึ่งเป็น registry ของบทความทั้งหมด ใช้โดย `assets/me-articles.js` เพื่อ render หน้า `articles.html`

ข้อมูลที่เก็บต่อบทความ:

- `slug`
- `archive_path`
- `title`
- `summary`
- `category`
- `date` และ `display_date`
- `image_index`
- `image_alt`
- `tags`

เนื้อหาบทความจริงอยู่ใน:

```text
articles/*.html
```

หลายบทความมี reference link ไปยัง Facebook post หรือแหล่งอ้างอิงอื่น และมี structured data แบบ `application/ld+json` สำหรับ SEO

### Static content ใน repository

บางหน้ามีข้อมูลเขียนไว้ใน HTML โดยตรง ไม่ได้โหลดจาก API:

- `index.html` และ `index-en.html`: ข้อมูลแนะนำตัว งานหลัก ช่องทางติดต่อ และ work areas
- `classes.html`: รายวิชาปัจจุบันภาคต้น 2569
- `apps.html`: รายการลิงก์ระบบและเว็บทดลอง
- `research.html`, `teaching.html`, `university-systems.html`: เนื้อหาเฉพาะทางหรือหน้าเก่าที่เก็บไว้ใน repository

### Assets และ metadata

แหล่งข้อมูลประกอบการแสดงผล:

- `assets/*.jpg`, `assets/*.JPG`, `assets/*.png`, `assets/*.svg`: รูปประกอบ หน้า OG image ภาพบทความ และภาพ slide/archive
- `sitemap.xml` และ `sitemap.txt`: รายการ URL สำหรับ search engine และการตรวจสอบ sitemap
- `robots.txt`: directive สำหรับ crawler
- Google Fonts: โหลดฟอนต์ Sarabun จาก `fonts.googleapis.com` และ `fonts.gstatic.com`

## โครงสร้างไฟล์

```text
.
├── index.html                 # หน้าแรกภาษาไทย
├── index-en.html              # หน้าแรกภาษาอังกฤษ
├── profile.html               # ข้อมูล profile
├── publications.html          # ผลงานวิจัย
├── classes.html               # รายวิชาและงานสอน
├── articles.html              # หน้ารวมบทความ
├── apps.html                  # ลิงก์แอปและเว็บทดลอง
├── articles/                  # ไฟล์บทความแบบ static HTML
├── assets/                    # CSS, JavaScript, รูปภาพ และข้อมูลบทความ
├── sitemap.xml                # sitemap สำหรับ search engine
├── sitemap.txt                # รายการ URL สำหรับตรวจสอบ sitemap
├── robots.txt                 # robots directive
└── .nojekyll                  # ปิด Jekyll processing บน GitHub Pages
```

## เทคโนโลยี

- HTML, CSS และ JavaScript แบบ static
- ใช้ฟอนต์ Sarabun จาก Google Fonts
- ใช้ `assets/site.css` เป็น stylesheet หลัก
- ใช้ `assets/site-shell.js` สำหรับ normalize brand text
- ใช้ `assets/articles-data.js` และ `assets/me-articles.js` สำหรับข้อมูลและการแสดงรายการบทความ
- ใช้ `assets/urban-profile.js` สำหรับหน้า Profile และ Classes
- ใช้ `assets/publications.js` สำหรับหน้า Publications

## การเปิดดูในเครื่อง

เปิด `index.html` ด้วย browser ได้โดยตรง หรือรัน local server เพื่อให้ path และ asset ทำงานใกล้เคียงกับ production:

```bash
python3 -m http.server 8000
```

จากนั้นเปิด:

```text
http://localhost:8000/
```

## การอัปขึ้น GitHub

ตรวจสอบสถานะไฟล์:

```bash
git status
```

เพิ่มไฟล์ทั้งหมดที่ต้องการ commit:

```bash
git add .
```

สร้าง commit:

```bash
git commit -m "Update website"
```

อัปขึ้น GitHub:

```bash
git push
```

ถ้าใช้ GitHub Pages ให้ตั้งค่า repository ที่ GitHub:

1. ไปที่ `Settings` > `Pages`
2. เลือก source เป็น branch ที่ใช้เผยแพร่ เช่น `main`
3. เลือก folder เป็น `/root`
4. บันทึกและรอ GitHub Pages deploy

## หมายเหตุสำหรับการดูแลเว็บ

- เมื่อเพิ่มหน้าใหม่ ควรเพิ่มลิงก์ใน navigation ของหน้าที่เกี่ยวข้อง
- เมื่อเพิ่มบทความใหม่ใน `articles/` ควรเพิ่มข้อมูลใน `assets/articles-data.js`
- หลังเพิ่มหรือเปลี่ยน URL ควรอัปเดต `sitemap.xml`, `sitemap.txt` และตรวจสอบ `robots.txt`
- ไฟล์ `.nojekyll` ควรอยู่ใน repository เพื่อให้ GitHub Pages เสิร์ฟไฟล์ static ตามโครงสร้างจริง
