#!/usr/bin/env python3
"""Add the remaining cities from the client's list to the globe.

Skips the 5 already present (beijing, shanghai, jinan, qingdao, hong-kong) and
the duplicate Hangzhou. Each new city gets EN/SK/VN translations and 2 random
placeholder photos reused from the images already in Directus. Finally the
translations `sort` field is recomputed so rows group en -> vn -> sk.
"""
import json, os, urllib.request, urllib.error

URL = os.environ["DIRECTUS_URL"].rstrip("/")
TOKEN = os.environ["DIRECTUS_TOKEN"]
H = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}
LANG = {"en": 1, "sk": 2, "vn": 3}

# reusable placeholder photo UUIDs (already uploaded for the 5 real cities)
PHOTO_POOL = [
    "7e25c227-2bb5-43fb-9822-9e31a203861f", "ad631452-0cca-41d1-95cd-1529bf780ed8",
    "93b77a6c-807c-4aad-8a23-56fc3aaff129", "527c1ded-8bfd-4406-bd49-a4aa0aaf28da",
    "7841fdc6-f3f2-4177-a83b-fbebf619199e", "273865b8-729b-4d30-adcf-7da6b6282525",
    "6b1f066e-e949-44c8-acc0-3de0dec9adb1", "65ecd250-38b4-4854-8db5-389a3191501c",
    "03e4df67-9261-4ab9-947c-b535480fcc5a", "8287a4f9-3850-41e5-b1c4-7a0fcba4908d",
    "2d55f879-777a-4ac1-bcc3-6354084638e6", "15923ced-b0ef-45ae-b4bf-3f09110cb0c1",
    "652ebcd4-794d-46db-83e5-b6ab1e305ec7", "ccec8715-df0b-4ad9-af7c-685cfe155eb8",
    "ce99e5e7-3bbf-487a-a1e4-163f1890c563", "785abfb8-f822-4265-ac6f-e1f70b11a58d",
    "7e0b7cd3-112c-42ce-aeaf-a92373b33908", "b5cca877-7ecc-4eda-9398-a5216456bd72",
    "e0bc2b99-bdb5-4992-997b-cbb24e48606e", "bc333cfc-100d-4211-b318-9e58c20f1f68",
    "10ab4bf2-201d-4589-93ee-beed6ccd2668", "285c8505-08eb-482e-8e57-42ea85586711",
    "9bb90dff-3a59-45e9-8e3f-4e4a2b4d7cb8", "db8cc003-b8ed-47fb-80da-ccdc0000a240",
    "b92b44cb-7546-4663-97d0-9162d409c2a6", "8cb9e2f0-8e73-4c07-a3b6-ed9a7528a770",
    "d7c3fa19-55a6-48eb-87a9-b24640efdf24",
]


def api(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(URL + path, data=data, headers=H, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            raw = r.read().decode()
            return json.loads(raw) if raw.strip() else None
    except urllib.error.HTTPError as e:
        print(f"  ! HTTP {e.code} {method} {path}: {e.read().decode()[:300]}")
        raise


# sort continues after the existing 5 (sorts 1-5)
CITIES = [
    {"slug": "guangzhou", "lat": 23.1291, "lng": 113.2644, "sort": 6, "alt": 1.7, "tr": {
        "en": {"name": "Guangzhou", "business": "Guangzhou Trade & Export Office",
               "description": "Guangzhou is southern China's trading engine, home to the Canton Fair and centuries of export know-how. Tabernam works here to connect European buyers with the manufacturers who supply the world."},
        "sk": {"name": "Kanton", "business": "Obchodná a exportná kancelária Kanton",
               "description": "Kanton je obchodným motorom južnej Číny, domovom Kantonského veľtrhu a stáročných skúseností s exportom. Tabernam tu spája európskych nákupcov s výrobcami, ktorí zásobujú celý svet."},
        "vn": {"name": "Quảng Châu", "business": "Văn phòng Thương mại & Xuất khẩu Quảng Châu",
               "description": "Quảng Châu là động lực thương mại của miền Nam Trung Quốc, nơi tổ chức Hội chợ Canton và có hàng thế kỷ kinh nghiệm xuất khẩu. Tabernam hoạt động tại đây để kết nối người mua châu Âu với các nhà sản xuất cung ứng cho cả thế giới."}}},
    {"slug": "chengdu", "lat": 30.5728, "lng": 104.0668, "sort": 7, "alt": 1.7, "tr": {
        "en": {"name": "Chengdu", "business": "Chengdu Western Gateway",
               "description": "The relaxed capital of Sichuan is China's gateway to the west. From Chengdu, Tabernam reaches inland markets, technology parks, and partners far beyond the coast."},
        "sk": {"name": "Čcheng-tu", "business": "Západná brána Čcheng-tu",
               "description": "Uvoľnené hlavné mesto provincie S’-čchuan je čínskou bránou na západ. Z Čcheng-tu siaha Tabernam na vnútrozemské trhy, do technologických parkov a k partnerom ďaleko od pobrežia."},
        "vn": {"name": "Thành Đô", "business": "Cửa ngõ phía Tây Thành Đô",
               "description": "Thủ phủ thư thái của tỉnh Tứ Xuyên là cửa ngõ của Trung Quốc về phía tây. Từ Thành Đô, Tabernam vươn tới các thị trường nội địa, khu công nghệ và đối tác xa khỏi vùng duyên hải."}}},
    {"slug": "chongqing", "lat": 29.5630, "lng": 106.5516, "sort": 8, "alt": 1.7, "tr": {
        "en": {"name": "Chongqing", "business": "Chongqing Yangtze Office",
               "description": "A mountain megacity straddling the Yangtze, Chongqing pairs heavy industry with one of the world's busiest inland ports. For Tabernam it is a hub for manufacturing and logistics deals."},
        "sk": {"name": "Čchung-čching", "business": "Kancelária Čchung-čching na Jang-c’-ťiang",
               "description": "Horská megamestská aglomerácia na rieke Jang-c’-ťiang spája ťažký priemysel s jedným z najrušnejších vnútrozemských prístavov sveta. Pre Tabernam je centrom dohôd v oblasti výroby a logistiky."},
        "vn": {"name": "Trùng Khánh", "business": "Văn phòng Trường Giang Trùng Khánh",
               "description": "Là siêu đô thị miền núi nằm hai bên bờ Trường Giang, Trùng Khánh kết hợp công nghiệp nặng với một trong những cảng nội địa bận rộn nhất thế giới. Với Tabernam, đây là trung tâm cho các thỏa thuận sản xuất và logistics."}}},
    {"slug": "shenzhen", "lat": 22.5429, "lng": 114.0596, "sort": 9, "alt": 1.7, "tr": {
        "en": {"name": "Shenzhen", "business": "Shenzhen Innovation Office",
               "description": "From a fishing village to China's Silicon Valley in a generation, Shenzhen sets the pace for technology and design. Tabernam partners here with the innovators shaping tomorrow's products."},
        "sk": {"name": "Šen-čen", "business": "Inovačná kancelária Šen-čen",
               "description": "Za jednu generáciu sa zo Šen-čenu stalo čínske Silicon Valley a udáva tempo v technológiách a dizajne. Tabernam tu spolupracuje s inovátormi, ktorí formujú produkty zajtrajška."},
        "vn": {"name": "Thâm Quyến", "business": "Văn phòng Đổi mới Thâm Quyến",
               "description": "Từ một làng chài trở thành Thung lũng Silicon của Trung Quốc chỉ trong một thế hệ, Thâm Quyến dẫn đầu về công nghệ và thiết kế. Tabernam hợp tác tại đây với những nhà đổi mới đang định hình sản phẩm của tương lai."}}},
    {"slug": "tianjin", "lat": 39.0842, "lng": 117.2009, "sort": 10, "alt": 1.7, "tr": {
        "en": {"name": "Tianjin", "business": "Tianjin Port Office",
               "description": "Beijing's gateway to the sea, Tianjin combines a major port with a strong manufacturing base. Tabernam uses it to move goods and close trade agreements in the north."},
        "sk": {"name": "Tchien-ťin", "business": "Prístavná kancelária Tchien-ťin",
               "description": "Tchien-ťin, brána Pekingu k moru, spája veľký prístav so silnou priemyselnou základňou. Tabernam ho využíva na prepravu tovaru a uzatváranie obchodných dohôd na severe."},
        "vn": {"name": "Thiên Tân", "business": "Văn phòng Cảng Thiên Tân",
               "description": "Là cửa ngõ ra biển của Bắc Kinh, Thiên Tân kết hợp một cảng lớn với nền tảng sản xuất vững mạnh. Tabernam dùng nơi đây để vận chuyển hàng hóa và hoàn tất các thỏa thuận thương mại ở miền Bắc."}}},
    {"slug": "xian", "lat": 34.3416, "lng": 108.9398, "sort": 11, "alt": 1.7, "tr": {
        "en": {"name": "Xi'an", "business": "Xi'an Silk Road Office",
               "description": "Where the ancient Silk Road began, Xi'an still bridges East and West. Tabernam builds partnerships here in aerospace, education, and the new overland routes to Europe."},
        "sk": {"name": "Si-an", "business": "Kancelária Hodvábnej cesty Si-an",
               "description": "Tam, kde sa začínala starobylá Hodvábna cesta, Si-an dodnes spája Východ a Západ. Tabernam tu buduje partnerstvá v letectve, vzdelávaní a na nových pozemných trasách do Európy."},
        "vn": {"name": "Tây An", "business": "Văn phòng Con đường Tơ lụa Tây An",
               "description": "Nơi Con đường Tơ lụa cổ xưa bắt đầu, Tây An đến nay vẫn nối liền Đông và Tây. Tabernam xây dựng quan hệ đối tác tại đây trong lĩnh vực hàng không, giáo dục và các tuyến đường bộ mới sang châu Âu."}}},
    {"slug": "hangzhou", "lat": 30.2741, "lng": 120.1551, "sort": 12, "alt": 1.7, "tr": {
        "en": {"name": "Hangzhou", "business": "Hangzhou Digital Commerce Office",
               "description": "Famous for West Lake and as the home of China's e-commerce giants, Hangzhou is where tradition meets digital trade. Tabernam connects partners to its thriving online economy."},
        "sk": {"name": "Chang-čou", "business": "Kancelária digitálneho obchodu Chang-čou",
               "description": "Chang-čou, známe Západným jazerom a ako domov čínskych gigantov elektronického obchodu, je miestom, kde sa tradícia stretáva s digitálnym obchodom. Tabernam tu prepája partnerov s prekvitajúcou online ekonomikou."},
        "vn": {"name": "Hàng Châu", "business": "Văn phòng Thương mại Số Hàng Châu",
               "description": "Nổi tiếng với Tây Hồ và là quê hương của các ông lớn thương mại điện tử Trung Quốc, Hàng Châu là nơi truyền thống gặp gỡ thương mại số. Tabernam kết nối đối tác với nền kinh tế trực tuyến sôi động của thành phố."}}},
    {"slug": "foshan", "lat": 23.0218, "lng": 113.1219, "sort": 13, "alt": 1.7, "tr": {
        "en": {"name": "Foshan", "business": "Foshan Manufacturing Office",
               "description": "A manufacturing powerhouse in the Pearl River Delta, Foshan makes everything from ceramics to home appliances. Tabernam sources and partners with its factories on behalf of European clients."},
        "sk": {"name": "Foshan", "business": "Výrobná kancelária Foshan",
               "description": "Foshan, priemyselná veľmoc v delte Perlovej rieky, vyrába všetko od keramiky po domáce spotrebiče. Tabernam tu v mene európskych klientov nakupuje a spolupracuje s tamojšími továrňami."},
        "vn": {"name": "Phật Sơn", "business": "Văn phòng Sản xuất Phật Sơn",
               "description": "Là một cường quốc sản xuất ở đồng bằng Châu Giang, Phật Sơn làm ra mọi thứ từ gốm sứ đến đồ gia dụng. Tabernam tìm nguồn và hợp tác với các nhà máy nơi đây thay mặt cho khách hàng châu Âu."}}},
    {"slug": "nanjing", "lat": 32.0603, "lng": 118.7969, "sort": 14, "alt": 1.7, "tr": {
        "en": {"name": "Nanjing", "business": "Nanjing Heritage Office",
               "description": "A former imperial capital on the Yangtze, Nanjing blends deep history with modern industry and learning. Tabernam fosters academic and commercial ties across the city."},
        "sk": {"name": "Nanking", "business": "Kancelária dedičstva Nanking",
               "description": "Nanking, bývalé cisárske hlavné mesto na rieke Jang-c’-ťiang, spája hlbokú históriu s moderným priemyslom a vzdelávaním. Tabernam tu rozvíja akademické aj obchodné vzťahy."},
        "vn": {"name": "Nam Kinh", "business": "Văn phòng Di sản Nam Kinh",
               "description": "Là cố đô bên bờ Trường Giang, Nam Kinh hòa quyện bề dày lịch sử với công nghiệp và học thuật hiện đại. Tabernam vun đắp các mối quan hệ học thuật và thương mại khắp thành phố."}}},
    {"slug": "changsha", "lat": 28.2282, "lng": 112.9388, "sort": 15, "alt": 1.7, "tr": {
        "en": {"name": "Changsha", "business": "Changsha Media & Industry Office",
               "description": "The lively capital of Hunan is a center for media, culture, and heavy engineering. Tabernam works with its manufacturers and creative industries alike."},
        "sk": {"name": "Changsha", "business": "Mediálna a priemyselná kancelária Changsha",
               "description": "Živé hlavné mesto provincie Chu-nan je centrom médií, kultúry a ťažkého strojárstva. Tabernam spolupracuje s tamojšími výrobcami aj kreatívnym priemyslom."},
        "vn": {"name": "Trường Sa", "business": "Văn phòng Truyền thông & Công nghiệp Trường Sa",
               "description": "Thủ phủ sôi động của tỉnh Hồ Nam là trung tâm truyền thông, văn hóa và cơ khí nặng. Tabernam hợp tác với cả các nhà sản xuất lẫn ngành công nghiệp sáng tạo nơi đây."}}},
    {"slug": "xiamen", "lat": 24.4798, "lng": 118.0894, "sort": 16, "alt": 1.7, "tr": {
        "en": {"name": "Xiamen", "business": "Xiamen Maritime Trade Office",
               "description": "A garden city on the Taiwan Strait, Xiamen is one of China's most pleasant trading ports. Tabernam uses it as a base for maritime commerce and cross-strait business."},
        "sk": {"name": "Sia-men", "business": "Námorná obchodná kancelária Sia-men",
               "description": "Sia-men, záhradné mesto pri Taiwanskom prielive, patrí k najpríjemnejším obchodným prístavom Číny. Tabernam ho využíva ako základňu pre námorný obchod a obchod cez prieliv."},
        "vn": {"name": "Hạ Môn", "business": "Văn phòng Thương mại Hàng hải Hạ Môn",
               "description": "Là thành phố vườn bên eo biển Đài Loan, Hạ Môn là một trong những cảng thương mại dễ chịu nhất Trung Quốc. Tabernam dùng nơi đây làm cơ sở cho thương mại hàng hải và kinh doanh xuyên eo biển."}}},
    {"slug": "ningbo", "lat": 29.8683, "lng": 121.5440, "sort": 17, "alt": 1.7, "tr": {
        "en": {"name": "Ningbo", "business": "Ningbo Port & Trade Office",
               "description": "Home to one of the world's busiest cargo ports, Ningbo moves goods for the entire Yangtze region. Tabernam relies on it for shipping and trade across Europe and Asia."},
        "sk": {"name": "Ningbo", "business": "Prístavná a obchodná kancelária Ningbo",
               "description": "Ningbo, domov jedného z najrušnejších nákladných prístavov sveta, prepravuje tovar pre celý región rieky Jang-c’-ťiang. Tabernam sa naň spolieha pri preprave a obchode medzi Európou a Áziou."},
        "vn": {"name": "Ninh Ba", "business": "Văn phòng Cảng & Thương mại Ninh Ba",
               "description": "Là nơi có một trong những cảng hàng hóa bận rộn nhất thế giới, Ninh Ba luân chuyển hàng hóa cho cả vùng Trường Giang. Tabernam dựa vào nơi đây để vận chuyển và giao thương khắp châu Âu và châu Á."}}},
    {"slug": "suzhou", "lat": 31.2989, "lng": 120.5853, "sort": 18, "alt": 1.7, "tr": {
        "en": {"name": "Suzhou", "business": "Suzhou Industrial Park Office",
               "description": "Famous for classical gardens and a world-class industrial park, Suzhou marries beauty with high-tech manufacturing. Tabernam partners here with advanced industry just outside Shanghai."},
        "sk": {"name": "Su-čou", "business": "Kancelária priemyselného parku Su-čou",
               "description": "Su-čou, preslávené klasickými záhradami a špičkovým priemyselným parkom, spája krásu s high-tech výrobou. Tabernam tu, hneď za Šanghajom, spolupracuje s pokročilým priemyslom."},
        "vn": {"name": "Tô Châu", "business": "Văn phòng Khu Công nghiệp Tô Châu",
               "description": "Nổi tiếng với những khu vườn cổ điển và một khu công nghiệp đẳng cấp thế giới, Tô Châu kết hợp vẻ đẹp với sản xuất công nghệ cao. Tabernam hợp tác tại đây với ngành công nghiệp tiên tiến ngay sát Thượng Hải."}}},
    {"slug": "hefei", "lat": 31.8206, "lng": 117.2272, "sort": 19, "alt": 1.7, "tr": {
        "en": {"name": "Hefei", "business": "Hefei Technology Office",
               "description": "A rising science and technology hub, Hefei is home to leading research institutes and display manufacturers. Tabernam connects European partners to its innovation economy."},
        "sk": {"name": "Hefei", "business": "Technologická kancelária Hefei",
               "description": "Hefei, rastúce centrum vedy a techniky, je domovom popredných výskumných ústavov a výrobcov displejov. Tabernam prepája európskych partnerov s jeho inovačnou ekonomikou."},
        "vn": {"name": "Hợp Phì", "business": "Văn phòng Công nghệ Hợp Phì",
               "description": "Là một trung tâm khoa học và công nghệ đang lên, Hợp Phì là nơi đặt các viện nghiên cứu hàng đầu và các nhà sản xuất màn hình. Tabernam kết nối đối tác châu Âu với nền kinh tế đổi mới của thành phố."}}},
    {"slug": "songpan", "lat": 32.6356, "lng": 103.5969, "sort": 20, "alt": 1.7, "tr": {
        "en": {"name": "Songpan", "business": "Songpan Highland Office",
               "description": "High on the edge of the Tibetan plateau, Songpan is an ancient garrison town and gateway to Sichuan's mountains. Tabernam supports tourism and cultural exchange in the highlands."},
        "sk": {"name": "Sung-pan", "business": "Horská kancelária Sung-pan",
               "description": "Sung-pan, vysoko na okraji Tibetskej náhornej plošiny, je starobylé posádkové mesto a brána do hôr provincie S’-čchuan. Tabernam tu podporuje cestovný ruch a kultúrnu výmenu."},
        "vn": {"name": "Tùng Phan", "business": "Văn phòng Cao nguyên Tùng Phan",
               "description": "Nằm cao bên rìa cao nguyên Tây Tạng, Tùng Phan là một thị trấn đồn trú cổ và là cửa ngõ vào vùng núi Tứ Xuyên. Tabernam hỗ trợ du lịch và giao lưu văn hóa ở vùng cao."}}},
    {"slug": "jiuzhaigou", "lat": 33.2603, "lng": 103.9180, "sort": 21, "alt": 1.7, "tr": {
        "en": {"name": "Jiuzhaigou", "business": "Jiuzhaigou Nature Liaison",
               "description": "A UNESCO valley of turquoise lakes and waterfalls, Jiuzhaigou is one of China's natural wonders. Tabernam works here on tourism, conservation, and hospitality partnerships."},
        "sk": {"name": "Ťiou-čaj-kou", "business": "Styčná kancelária prírody Ťiou-čaj-kou",
               "description": "Ťiou-čaj-kou, údolie tyrkysových jazier a vodopádov zapísané v UNESCO, patrí k prírodným divom Číny. Tabernam tu pracuje na partnerstvách v cestovnom ruchu, ochrane prírody a pohostinstve."},
        "vn": {"name": "Cửu Trại Câu", "business": "Văn phòng Liên lạc Thiên nhiên Cửu Trại Câu",
               "description": "Là thung lũng được UNESCO công nhận với những hồ nước ngọc lam và thác nước, Cửu Trại Câu là một trong những kỳ quan thiên nhiên của Trung Quốc. Tabernam hoạt động tại đây trong lĩnh vực du lịch, bảo tồn và quan hệ đối tác khách sạn."}}},
    {"slug": "qiang-city", "lat": 31.6790, "lng": 103.8533, "sort": 22, "alt": 1.7, "tr": {
        "en": {"name": "Qiang City", "business": "Qiang City Cultural Office",
               "description": "A living showcase of Qiang ethnic heritage, Qiang City preserves the towers, crafts, and customs of one of China's oldest peoples. Tabernam supports cultural tourism and exchange here."},
        "sk": {"name": "Qiang City", "business": "Kultúrna kancelária Qiang City",
               "description": "Qiang City, živá ukážka dedičstva etnika Čchiang, uchováva veže, remeslá a zvyky jedného z najstarších národov Číny. Tabernam tu podporuje kultúrny cestovný ruch a výmenu."},
        "vn": {"name": "Khương Thành", "business": "Văn phòng Văn hóa Khương Thành",
               "description": "Là nơi trưng bày sống động di sản dân tộc Khương, Khương Thành gìn giữ những tòa tháp, nghề thủ công và phong tục của một trong những dân tộc lâu đời nhất Trung Quốc. Tabernam hỗ trợ du lịch văn hóa và giao lưu nơi đây."}}},
    {"slug": "maoxian", "lat": 31.6817, "lng": 103.8530, "sort": 23, "alt": 1.7, "tr": {
        "en": {"name": "Maoxian", "business": "Maoxian Mountain Office",
               "description": "Set among the mountains of northern Sichuan, Maoxian is the heartland of the Qiang people and famous for its highland fruit. Tabernam connects its agriculture and culture to wider markets."},
        "sk": {"name": "Maoxian", "business": "Horská kancelária Maoxian",
               "description": "Maoxian, zasadené medzi horami severného S’-čchuanu, je srdcom národa Čchiang a preslávené horským ovocím. Tabernam spája jeho poľnohospodárstvo a kultúru so širšími trhmi."},
        "vn": {"name": "Mậu Huyện", "business": "Văn phòng Miền núi Mậu Huyện",
               "description": "Nằm giữa núi non miền bắc Tứ Xuyên, Mậu Huyện là vùng đất trung tâm của người Khương và nổi tiếng với trái cây vùng cao. Tabernam kết nối nông nghiệp và văn hóa nơi đây với các thị trường rộng lớn hơn."}}},
    {"slug": "cangzhou", "lat": 38.3037, "lng": 116.8388, "sort": 24, "alt": 1.7, "tr": {
        "en": {"name": "Cangzhou", "business": "Cangzhou Logistics Office",
               "description": "A historic canal and coastal city known for martial arts and logistics, Cangzhou links Beijing's region to the sea. Tabernam uses it for distribution and industrial partnerships."},
        "sk": {"name": "Cangzhou", "business": "Logistická kancelária Cangzhou",
               "description": "Cangzhou, historické prieplavové a pobrežné mesto známe bojovými umeniami a logistikou, spája región Pekingu s morom. Tabernam ho využíva na distribúciu a priemyselné partnerstvá."},
        "vn": {"name": "Thương Châu", "business": "Văn phòng Logistics Thương Châu",
               "description": "Là thành phố kênh đào và ven biển giàu lịch sử, nổi tiếng với võ thuật và logistics, Thương Châu nối vùng Bắc Kinh ra biển. Tabernam dùng nơi đây cho phân phối và quan hệ đối tác công nghiệp."}}},
    {"slug": "taipei", "lat": 25.0330, "lng": 121.5654, "sort": 25, "alt": 1.7, "tr": {
        "en": {"name": "Taipei", "business": "Taipei Liaison Office",
               "description": "A vibrant meeting point of Chinese tradition and global business, Taipei is a key hub in the region. Tabernam maintains relationships here across technology and trade."},
        "sk": {"name": "Tchaj-pej", "business": "Styčná kancelária Tchaj-pej",
               "description": "Tchaj-pej, pulzujúce miesto stretnutia čínskej tradície a globálneho biznisu, je kľúčovým uzlom regiónu. Tabernam tu udržiava vzťahy v oblasti technológií a obchodu."},
        "vn": {"name": "Đài Bắc", "business": "Văn phòng Liên lạc Đài Bắc",
               "description": "Là điểm giao thoa sống động giữa truyền thống Trung Hoa và kinh doanh toàn cầu, Đài Bắc là một đầu mối quan trọng trong khu vực. Tabernam duy trì các mối quan hệ tại đây trong công nghệ và thương mại."}}},
    {"slug": "hohhot", "lat": 40.8426, "lng": 111.7490, "sort": 26, "alt": 1.7, "tr": {
        "en": {"name": "Hohhot", "business": "Hohhot Grassland Office",
               "description": "The capital of Inner Mongolia, Hohhot blends grassland culture with a booming dairy and energy economy. Tabernam works with its agricultural and industrial partners."},
        "sk": {"name": "Hohhot", "business": "Stepná kancelária Hohhot",
               "description": "Hohhot, hlavné mesto Vnútorného Mongolska, spája kultúru stepí s prekvitajúcim mliekarenským a energetickým hospodárstvom. Tabernam spolupracuje s jeho poľnohospodárskymi a priemyselnými partnermi."},
        "vn": {"name": "Hô Hòa Hạo Đặc", "business": "Văn phòng Thảo nguyên Hô Hòa Hạo Đặc",
               "description": "Là thủ phủ của Nội Mông, Hô Hòa Hạo Đặc hòa quyện văn hóa thảo nguyên với nền kinh tế sữa và năng lượng đang bùng nổ. Tabernam hợp tác với các đối tác nông nghiệp và công nghiệp nơi đây."}}},
    {"slug": "yiwu", "lat": 29.3068, "lng": 120.0758, "sort": 27, "alt": 1.7, "tr": {
        "en": {"name": "Yiwu", "business": "Yiwu Wholesale Trade Office",
               "description": "Home to the world's largest wholesale market, Yiwu supplies small goods to every corner of the globe. Tabernam sources here for clients who need everything in one place."},
        "sk": {"name": "Yiwu", "business": "Veľkoobchodná kancelária Yiwu",
               "description": "Yiwu, domov najväčšieho veľkoobchodného trhu sveta, zásobuje drobným tovarom celý svet. Tabernam tu nakupuje pre klientov, ktorí potrebujú všetko na jednom mieste."},
        "vn": {"name": "Nghĩa Ô", "business": "Văn phòng Thương mại Bán buôn Nghĩa Ô",
               "description": "Là nơi có chợ bán buôn lớn nhất thế giới, Nghĩa Ô cung cấp hàng tiêu dùng nhỏ đến mọi ngóc ngách của địa cầu. Tabernam tìm nguồn tại đây cho những khách hàng cần mọi thứ ở một nơi."}}},
]


WRITE_LANGS = ["en", "sk"]   # Vietnamese intentionally removed


def clear_children(activity_id):
    tr = api("GET", f"/items/activities_translations?filter[activities_id][_eq]={activity_id}&fields=id&limit=-1")["data"]
    if tr:
        api("DELETE", "/items/activities_translations", [r["id"] for r in tr])
    ph = api("GET", f"/items/activities_files?filter[activities_id][_eq]={activity_id}&fields=id&limit=-1")["data"]
    if ph:
        api("DELETE", "/items/activities_files", [r["id"] for r in ph])


def main():
    # purge any stray Vietnamese (language 3) rows left behind
    stray_vn = api("GET", "/items/activities_translations?filter[language][_eq]=3&fields=id&limit=-1")["data"]
    if stray_vn:
        api("DELETE", "/items/activities_translations", [r["id"] for r in stray_vn])
        print(f"== Purged {len(stray_vn)} stray Vietnamese translation rows ==")

    existing = api("GET", "/items/activities?fields=id,slug&limit=-1")["data"]
    slug_to_id = {r["slug"]: r["id"] for r in existing}

    print("== Creating / updating new cities (EN + SK) ==")
    for i, c in enumerate(CITIES):
        if c["slug"] in slug_to_id:
            aid = slug_to_id[c["slug"]]
            api("PATCH", f"/items/activities/{aid}", {
                "lat": c["lat"], "lng": c["lng"], "altitude": c["alt"], "sort": c["sort"],
            })
            clear_children(aid)
            verb = "updated"
        else:
            created = api("POST", "/items/activities", {
                "slug": c["slug"], "lat": c["lat"], "lng": c["lng"],
                "altitude": c["alt"], "sort": c["sort"],
            })
            aid = created["data"]["id"]
            verb = "created"
        for code in WRITE_LANGS:
            t = c["tr"][code]
            api("POST", "/items/activities_translations", {
                "activities_id": aid, "language": LANG[code],
                "name": t["name"], "business": t["business"], "description": t["description"],
            })
        p1 = PHOTO_POOL[(2 * i) % len(PHOTO_POOL)]
        p2 = PHOTO_POOL[(2 * i + 1) % len(PHOTO_POOL)]
        for s, uid in enumerate([p1, p2], start=1):
            api("POST", "/items/activities_files", {
                "activities_id": aid, "directus_files_id": uid, "sort": s,
            })
        print(f"- {verb} {c['slug']} (id {aid}) +2 tr +2 photos")

    print("\n== Re-applying language grouping sort (en -> sk) ==")
    acts = api("GET", "/items/activities?fields=id,sort&limit=-1")["data"]
    act_order = {a["id"]: a["sort"] for a in acts}   # activity_id -> map sort
    rows = api("GET", "/items/activities_translations?fields=id,activities_id,language&limit=-1")["data"]
    ranked = sorted(act_order.items(), key=lambda kv: kv[1])
    city_rank = {aid: idx for idx, (aid, _) in enumerate(ranked)}
    n = len(ranked)
    lang_base = {1: 0, 2: n}   # en block, then sk block
    updates = [{"id": r["id"], "sort": lang_base[r["language"]] + city_rank[r["activities_id"]] + 1}
               for r in rows]
    api("PATCH", "/items/activities_translations", updates)
    print(f"  updated sort on {len(updates)} translation rows")

    print("\n== Final city list ==")
    final = api("GET", "/items/activities?fields=sort,slug&sort=sort&limit=-1")["data"]
    for r in final:
        print(f"  {r['sort']:>2}  {r['slug']}")


if __name__ == "__main__":
    main()
