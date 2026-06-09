#!/usr/bin/env python3
"""Recreate Vietnamese content across the whole site.

- Page collections (nav/footer/contact/home/about/cv): create a vn row that
  copies the English row verbatim, then overrides the translatable text fields
  with Vietnamese. URLs, dates, emails and proper nouns are left as-is.
- Activities: restore vn for all 27 cities (text reused from the earlier
  migration scripts), then re-apply the en -> vn -> sk grouping sort.

Idempotent: deletes existing vn (language id 4) rows before re-inserting.
"""
import json, os, sys, urllib.request, urllib.error

URL = os.environ["DIRECTUS_URL"].rstrip("/")
TOKEN = os.environ["DIRECTUS_TOKEN"]
H = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}


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


# vn language id
VN = next(l["id"] for l in api("GET", "/items/languages?fields=id,code")["data"] if l["code"] == "vn")
EN = next(l["id"] for l in api("GET", "/items/languages?fields=id,code")["data"] if l["code"] == "en")

# ---- Vietnamese overrides for page collections ---------------------------
ABOUT_BODY = "\n\n".join([
    'Toàn bộ câu chuyện cuộc đời tôi, gần như trọn vẹn gắn với thương mại quốc tế, được thể hiện một cách khái quát trong bản lý lịch của tôi, thứ mà tôi sẽ gửi theo yêu cầu sau khi bạn nhấp vào "... NÚT...". Phần lớn thời gian của tôi gắn với ngành công nghiệp doanh nghiệp.',
    'Những trải nghiệm cụ thể trong thời gian tôi ở Hoa Kỳ, ở Nga, ở Trung Quốc và tại một công ty kỹ thuật của Đức, nơi tôi cũng là đồng sở hữu, đã cho tôi một bức tranh về những cách tiếp cận kinh doanh khác nhau giữa phương Tây và phương Đông.',
    'Khi Bộ Kinh tế tiếp cận tôi 15 năm trước để cải thiện việc quản lý ngoại thương trong bộ máy nhà nước, tôi đã vui vẻ nhận lấy thử thách này. Đó là cách tôi chuyển từ ngành công nghiệp doanh nghiệp sang bộ máy nhà nước trong lĩnh vực quản lý ngoại thương.',
    'Số lượng lớn các phái đoàn thương mại được thực hiện trên khắp thế giới trong năm thứ 6 và việc tinh chỉnh quy trình là một trải nghiệm tuyệt vời cho các công ty Slovakia, và tôi vui mừng rằng chúng hiện đang được tiếp nối.',
    'Sau đó tôi gia nhập ngành ngoại giao. Tất nhiên, tôi được phân công phụ trách Trung Quốc, nơi tôi đã giữ liên hệ thường xuyên suốt 30 năm. Với vai trò Nhà ngoại giao Đổi mới tại Bắc Kinh, tôi đã thiết lập thêm nhiều mối quan hệ xuất sắc trong lĩnh vực này. Đó chủ yếu là các mối quan hệ với môi trường đổi mới ở nhiều ban ngành khác nhau. Do trước đây tôi từng làm chuyên gia thẩm định của tòa án nhà nước về phát minh, bằng sáng chế, kiểu dáng công nghiệp và nhãn hiệu, nên tại Trung Quốc tôi đã trở nên rất am hiểu hệ thống bảo hộ quyền sở hữu công nghiệp đối với sản phẩm và dịch vụ, và chúng đã được áp dụng để bảo hộ các đổi mới của Slovakia.',
    'Hiện tại tôi làm việc trong các dự án lớn liên quan đến Trung Quốc, nơi tôi có kinh nghiệm phong phú nhất, và một phần với Việt Nam.',
    'Tôi vui mừng rằng sau khi trở về từ nhiệm vụ ngoại giao tại Trung Quốc, nơi tôi làm việc với vai trò nhà ngoại giao về đổi mới, tôi có thể tiếp tục làm việc trong lĩnh vực ngoại thương với châu Á. Sau 30 năm kinh nghiệm trong lĩnh vực này, tôi cung cấp tư vấn cho các công ty lớn và hiện thực hóa các lợi ích đầu tư của các công ty Trung Quốc tại Slovakia, và cả theo chiều ngược lại.',
    'Trong các năm 2024 - 25, tôi đã xây dựng được một hệ thống cung ứng toàn diện về máy móc xây dựng hạng nặng cho một công ty xây dựng Slovakia, chẳng hạn như [dự án này](https://youtu.be/9Y_RcKRNs54). Trong thương mại và đầu tư quốc tế, tôi cung cấp dịch vụ toàn diện cho việc gia nhập của các đơn vị nước ngoài vào Slovakia.',
    'Hiện tôi đang phát triển những dự án lớn khác. Cho đến nay, tôi vẫn chưa thể nghỉ ngơi, kể cả trong công việc từ thiện.',
    'Tôi vui vẻ áp dụng nhiều lợi ích từ thương mại quốc tế vào hoạt động từ thiện. Tôi là thành viên của [Dòng Hiệp sĩ Malta Quốc tế](www.orderofmalta.int) và [Hiệp hội Lions Club International](www.lionsclubs.org) cũng như [Câu lạc bộ Đức](www.owwf.bayern).',
    'Những dự án từ thiện lớn mà tôi thực hiện, chẳng hạn như việc xây dựng một [bệnh viện ở Kenya](https://www.youtube.com/watch?v=0Trp2tsyKxY), thu hút nhiều doanh nhân cùng chung tay vào việc thiện.',
    'Với tư cách là [thành viên](www.tiborlions.eu) của GMT (Global Membership Team) phụ trách toàn bộ các quốc gia Trung và Đông Âu, tôi đã đích thân tham gia tạo nên một hoạt động quốc tế nhằm phát triển công tác từ thiện trên toàn thế giới dưới sự bảo trợ của [LCIF](www.lionsclubs.org/en/donate) trong năm 2008 tại trụ sở Hoa Kỳ của LCI ở thành phố Oak Brook, ILLINOIS.',
    'Một sự hỗ trợ to lớn như một hành động từ thiện tiếp theo của các nhà đầu tư cũng có thể thấy ở việc giúp đỡ người bệnh, chẳng hạn như [Chuyến đi đến Lourdes](https://youtu.be/URyM7a1Vskk), mà tôi đã thực hiện trong hai năm cùng đội ngũ của mình vào 2015-16.',
    'Vâng, công việc từ thiện là một phần trong các hoạt động của tôi dành cho những người đang rất cần giúp đỡ. Người có nhiều hơn có nghĩa vụ đạo đức phải giúp đỡ những người khó khăn.',
    'Xét việc tôi đã thực hiện những dự án từ thiện lớn hơn, tôi vui mừng nhận lời mời tham dự sự kiện từ thiện lớn nhất sẽ được tổ chức tại Hồng Kông vào năm 2026.',
    'Tôi đã thể hiện sự kết hợp giữa năng lượng doanh nhân và sự tận tâm cả đời cho từ thiện trong một khẩu hiệu.',
    'Nó được thể hiện bằng tiếng Latinh: {{LATIN}},',
    'và dịch ra: **"Kiếm tiền chân chính, cho đi hào phóng."**',
])

OVERRIDES = {
    "nav": {
        "nav_home": "Trang chủ", "nav_about": "Về tôi", "nav_contact": "Liên hệ",
    },
    "footer": {
        "footer_copyright": "© 2026 Tabernam. Bảo lưu mọi quyền.",
        "footer_exploreHeading": "Khám phá",
        "footer_quote": "Kiếm tiền chân chính, cho đi hào phóng",
        # footer_location, footer_quote_author kept verbatim
    },
    "contact": {
        "heading_title": "Hãy liên hệ",
        "subheading": "Nếu bạn đang thâm nhập, mở rộng hoặc tái định vị hoạt động kinh doanh giữa châu Âu và Trung Quốc — hoặc đơn giản là muốn một ý kiến thẳng thắn trước bước đi tiếp theo — tôi luôn sẵn lòng trò chuyện. Hãy liên hệ với tôi qua bất kỳ kênh nào bên dưới phù hợp với bạn.",
        "contact_addressLabel": "Địa chỉ",
        "contact_emailLabel": "Email",
        "contact_phoneLabel": "Điện thoại",
        "contact_websiteLabel": "Trang web",
        "heading_contact": "Liên hệ",
        "contact_wechatLabel": "WeChat",
    },
    "home": {
        "hero_title": "Bốn thập kỷ ngoại thương",
        "hero_body": "Cầu nối đáng tin cậy giữa Slovakia và Trung Quốc, Việt Nam, Đức, Hoa Kỳ, Pháp, Lào, Singapore, Nga, Ukraine, Kazakhstan, Kenya và nhiều quốc gia khác",
        "quote_primary": "Thương mại không phải là một giao dịch. Đó là một mối quan hệ — được xây dựng qua nhiều thập kỷ, duy trì bằng niềm tin, và được đo bằng những gì còn lại rất lâu sau khi hợp đồng được ký kết.",
        "globe_intro_heading": "Một sự nghiệp trải dài khắp các châu lục.",
        "globe_intro_body": "Hãy nhấp vào những điểm mà trong suốt 4 thập kỷ ngoại thương, các mối quan hệ đã được xây dựng với con người tại các nhà máy hay bên bàn đàm phán, hoặc những dự án tốt đẹp được tạo nên qua các hoạt động từ thiện, mà có rất nhiều trên khắp thế giới",
        "globe_intro_cta": "Xem các thành phố",
        "about_eyebrow": "Ngoại giao & Đổi mới",
        "about_body_1": "Tôi vui mừng rằng sau khi trở về từ nhiệm vụ ngoại giao tại Trung Quốc, nơi tôi làm việc với vai trò nhà ngoại giao về đổi mới, tôi có thể tiếp tục làm việc trong lĩnh vực ngoại thương với châu Á, đặc biệt là với Trung Quốc.",
        "about_body_2": "Sau 30 năm kinh nghiệm trong lĩnh vực này, tôi cung cấp tư vấn cho các công ty lớn và hiện thực hóa các lợi ích đầu tư của các công ty Trung Quốc tại Slovakia, và cả theo chiều ngược lại.",
        "btn_getToKnowMore": "Tìm hiểu thêm về tôi",
        "globe_hint_drag": "Kéo để di chuyển\nquả địa cầu",
        "globe_hint_zoom": "Phóng to & thu nhỏ\nđể xem",
        "globe_hint_clickCity": "Nhấp vào thành phố để\nxem chi tiết",
        "globe_zoom_maxToast": "Đã phóng to tối đa — không thể phóng to thêm.",
        "globe_zoom_minToast": "Đã thu nhỏ tối đa — không thể thu nhỏ thêm.",
        "region_world": "Thế giới", "region_europe": "Châu Âu", "region_asia": "Châu Á",
        "region_africa": "Châu Phi", "region_americas": "Châu Mỹ", "region_oceania": "Châu Đại Dương",
        "panel_goToLocation": "Đến địa điểm",
        "btn_exploreNow": "Khám phá ngay",
        "quote_title_accent": "Xây dựng trên niềm tin,",
        "quote_title_rest": " không phải giao dịch",
    },
    "about": {
        "experience_eyebrow": "Câu chuyện thành công nổi bật",
        "experience_title": "Kinh nghiệm & Câu chuyện thành công",
        "experience_body": "Dựa trên kinh nghiệm trong môi trường sản xuất doanh nghiệp cũng như kinh nghiệm của tôi tại Bộ Kinh tế, nhiều câu chuyện thành công đã được hiện thực hóa. Trong thương mại và đầu tư quốc tế, tôi và đội ngũ của mình cung cấp dịch vụ toàn diện cho việc gia nhập của các đơn vị nước ngoài vào Slovakia.",
        "experience_video_title": "Đổi mới trong ngoại thương: Những câu chuyện thành công tại Slovakia",
        "philanthropy_story_1_title": "Xây dựng bệnh viện tại Kenya",
        "philanthropy_story_2_title": "Chuyến đi đến Lourdes",
        "closing_quote": "Vâng, công việc từ thiện là một phần trong các hoạt động của tôi dành cho những người đang rất cần giúp đỡ. Người có nhiều hơn có nghĩa vụ đạo đức phải giúp đỡ những người khó khăn.",
        "closing_cta": "Hãy liên hệ",
        "btn_viewCV": "Xem CV của tôi",
        "heading_aboutMe": "Về tôi",
        "about_paragraph_body": ABOUT_BODY,
        "about_eyebrow": "Ngoại giao & Đổi mới",
        "travel_routes_heading": "Hành trình của tôi",
        "travel_routes_body": "Công việc và sự tò mò đã đưa tôi đi khắp các châu lục — từ những chương dài ở châu Á đến những dự án trải khắp châu Âu. Mỗi điểm đến đều để lại điều gì đó: một đối tác, một bài học, một câu chuyện đáng kể. Hãy khám phá những nơi tôi đã đến, và liên hệ với tôi nếu có nơi nào trong số đó khiến bạn quan tâm.",
        "travel_routes_china_name": "Trung Quốc",
        "travel_routes_america_name": "Châu Mỹ",
        "travel_routes_europe_name": "Châu Âu",
        # hero_name kept verbatim
    },
    "cv": {
        "section_education": "Học vấn", "section_experience": "Kinh nghiệm làm việc",
        "section_china": "Hoạt động tại Trung Quốc", "section_languages": "Ngôn ngữ",
        "section_skills": "Kỹ năng cá nhân",
        "edu_0_title": "Nghi thức Quốc tế", "edu_0_org": "Dòng Malta — Praha",
        "edu_1_title": "Học viện MOFCOM Bắc Kinh — chứng chỉ",
        "edu_1_org": "Học viện Bộ Thương mại Cộng hòa Nhân dân Trung Hoa — Bắc Kinh",
        "edu_2_title": "Bất động sản & Kinh doanh tại Florida — chứng chỉ",
        "edu_2_org": "Thực tập ở nước ngoài — Hoa Kỳ, Florida · Bất động sản và Kinh doanh",
        "edu_3_title": "Nghiên cứu sau đại học — chuyên gia thẩm định của tòa án",
        "edu_3_org": "Giám định viên về bằng sáng chế và nhãn hiệu · SVŠT Bratislava · kỳ thi nhà nước về luật sáng chế Hoa Kỳ và châu Âu",
        "edu_4_title": "Đại học — Bằng Kỹ sư",
        "edu_4_org": "Khoa Kỹ thuật Điện và Cơ khí · Đại học Giao thông Vận tải — Žilina",
        "edu_5_title": "Trường trung học phổ thông",
        # edu_5_org (place names) kept verbatim; all *_date kept verbatim
        "exp_0_title": "Giám đốc & Chủ sở hữu",
        "exp_0_date": "01/2023 – Hiện tại",
        "exp_0_desc": "Tư vấn cho các công ty phát triển và đầu tư từ châu Á, đặc biệt là Trung Quốc. Mua sắm máy móc xây dựng cỡ lớn từ Trung Quốc và triển khai công nghệ cho các công ty Slovakia và nước ngoài.",
        "exp_1_title": "Giám đốc Quan hệ Đối ngoại",
        "exp_1_desc": "Hiệp hội Hỗ trợ Đầu tư SARIO trực thuộc Bộ Kinh tế Cộng hòa Slovakia. Hỗ trợ các nhà đầu tư nước ngoài tại Slovakia.",
        "exp_2_title": "Nhà ngoại giao Đổi mới",
        "exp_2_org": "Đại sứ quán Slovakia tại Trung Quốc — Bắc Kinh",
        "exp_2_desc": "Nhà ngoại giao đổi mới tại đại sứ quán ở Bắc Kinh cho MIRRI (Bộ Đầu tư, Phát triển Vùng và Tin học hóa). Cố vấn cho Phó Thủ tướng Cộng hòa Slovakia tại Trung Quốc về các công nghệ VIP và về việc thiết lập hợp tác với các công ty công nghệ cao của Trung Quốc.",
        "exp_3_title": "Giám đốc Phân ban Ngoại thương",
        "exp_3_org": "SARIO — Bộ Kinh tế Cộng hòa Slovakia, Bratislava",
        "exp_3_desc": "Cơ quan Phát triển Đầu tư và Thương mại Slovakia.",
        "exp_4_title": "Giám đốc Thương mại",
        "exp_4_desc": "Giám đốc thương mại của một công ty xây dựng. Xây dựng các dự án đầu tư cho các công ty nước ngoài, chiến lược tăng trưởng và phát triển công ty.",
        "exp_5_title": "Tổng Giám đốc & Thành viên Hội đồng Quản trị",
        "exp_5_desc": "Sản xuất và xuất khẩu đồ nội thất và các sản phẩm chế biến gỗ khắp châu Á và châu Âu.",
        "exp_6_title": "Tổng Giám đốc",
        "exp_6_desc": "Xuất nhập khẩu hàng hóa và công nghệ (Trung Quốc, Việt Nam, Indonesia, Nhật Bản, Hoa Kỳ, Đức, Nga, Áo, Hà Lan).",
        "exp_7_title": "Chuyên viên Hàng hóa",
        "exp_7_desc": "Xuất khẩu các dự án đầu tư và hàng hóa thương mại sang các quốc gia ở Bắc Phi, châu Á và châu Âu.",
        "exp_8_title": "Thực tập ở nước ngoài",
        "exp_8_org": "Trường Bất động sản về Kinh doanh, Phát triển và Xây dựng — Hoa Kỳ, Florida",
        "china_0_text": "Tìm nguồn hàng hóa thương mại từ các nhà sản xuất Trung Quốc ở Ôn Châu, Nội Mông và Hồng Kông.",
        "china_1_text": "Tư vấn cho công ty Đức Görlitz-Berlin về sản xuất cơ khí tại Hồng Kông, Ma Cao và Bắc Kinh.",
        "china_2_text": "Hoạt động thương mại và tư vấn trong ngành chế biến gỗ tại Thiên Tân.",
        "china_3_text": "Hoạt động tư vấn cho các công ty Trung Quốc từ Thương Châu, Hồng Kông, Thượng Hải và Bắc Kinh.",
        "china_4_text": "Đồng hành cùng các công ty Trung Quốc tại Slovakia trong thời gian tôi công tác ở Bộ Kinh tế.",
        "china_5_text": "Chủ động tham gia ngoại giao tại Bắc Kinh để xây dựng hợp tác với các công ty công nghệ cao của Trung Quốc.",
        "china_6_text": "Thiết lập đại diện tại Slovakia cho các công ty Trung Quốc ZOOMLION và SHANTUI.",
        "china_7_text": "Triển khai công nghệ xây dựng của công ty Trung Quốc CSCEC — Trường Sa cho một quỹ đầu tư của Liechtenstein để xây dựng căn hộ cho thuê tại Slovakia.",
        "china_8_text": "Hợp tác với các công ty Trung Quốc khác để triển khai các hoạt động thương mại, đầu tư và phát triển tại Slovakia và châu Âu.",
        "china_8_years": "hiện tại",
        "lang_0_name": "Tiếng Slovak", "lang_0_descriptor": "Tiếng mẹ đẻ",
        "lang_1_name": "Tiếng Anh", "lang_1_descriptor": "Nâng cao",
        "lang_2_name": "Tiếng Nga", "lang_2_descriptor": "Nâng cao",
        "lang_3_name": "Tiếng Đức", "lang_3_descriptor": "Trung cấp",
        "lang_4_name": "Tiếng Pháp", "lang_4_descriptor": "Trung cấp",
        "skill_0": "Thành lập, phát triển và quản lý các công ty và tổ chức có yếu tố nước ngoài.",
        "skill_1": "Lãnh đạo và truyền cảm hứng cho các đội nhóm trong các quy trình hợp tác.",
        "skill_2": "Phán đoán sáng suốt trong việc ra quyết định chiến lược.",
        "skill_3": "Xây dựng ứng dụng di động cho các sự kiện và hội nghị ngành.",
        "skill_4": "Tối ưu hóa quy trình quản lý cho các công ty sản xuất và thương mại.",
        "cta_view_full": "Xem CV đầy đủ",
        "contact_intro": "Nếu bạn quan tâm đến CV của tôi, vui lòng liên hệ với tôi.",
        "contact_title": "Hãy liên hệ", "contact_cta": "Trang liên hệ",
        "modal_title": "Yêu cầu CV đầy đủ",
        "modal_intro": "Hãy gửi vài dòng cho Tibor và ông sẽ chia sẻ trực tiếp CV đầy đủ với bạn.",
        "modal_default_body": "Tôi muốn nhận CV đầy đủ.",
        "modal_subject": "Yêu cầu — CV đầy đủ (Tibor Buček)",
        "modal_field_name": "Tên", "modal_field_email": "Email", "modal_field_company": "Công ty",
        "modal_field_message": "Lời nhắn",
        "modal_message_placeholder": "Một dòng về lý do bạn muốn xem CV đầy đủ…",
        "modal_submit": "Gửi yêu cầu", "modal_cancel": "Hủy", "modal_close": "Đóng",
        "btn_goBack": "Quay lại",
        # hero_name kept verbatim
    },
}

PARENT_FK = {"nav": "nav_id", "footer": "footer_id", "contact": "contact_id",
             "home": "home_id", "about": "about_id", "cv": "cv_id"}


def page_translations():
    en_full = json.load(open("/tmp/en_full.json"))
    for coll, overrides in OVERRIDES.items():
        # delete any existing vn rows
        existing = api("GET", f"/items/{coll}_translations?filter[language][_eq]={VN}&fields=id&limit=-1")["data"]
        if existing:
            api("DELETE", f"/items/{coll}_translations", [r["id"] for r in existing])
        base = dict(en_full[coll])          # full EN row (incl parent FK + all fields)
        base["language"] = VN
        base.update(overrides)              # apply VN text
        api("POST", f"/items/{coll}_translations", base)
        translated = len(overrides)
        total = len([k for k in base if k not in ("language", PARENT_FK[coll])])
        print(f"  {coll}: vn row created ({translated} fields translated, {total - translated} copied verbatim)")


def city_translations():
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__))))
    import migrate_map_cities as m5
    import add_more_cities as m22
    city_vn = {}
    for c in m5.CITIES:
        city_vn[c["slug"]] = c["tr"]["vn"]
    for c in m22.CITIES:
        city_vn[c["slug"]] = c["tr"]["vn"]

    acts = api("GET", "/items/activities?fields=id,slug,sort&limit=-1")["data"]
    # purge existing vn rows
    existing = api(f"GET", f"/items/activities_translations?filter[language][_eq]={VN}&fields=id&limit=-1")["data"]
    if existing:
        api("DELETE", "/items/activities_translations", [r["id"] for r in existing])
    made = 0
    for a in acts:
        t = city_vn.get(a["slug"])
        if not t:
            print(f"  !! no VN text for {a['slug']}")
            continue
        api("POST", "/items/activities_translations", {
            "activities_id": a["id"], "language": VN,
            "name": t["name"], "business": t["business"], "description": t["description"],
        })
        made += 1
    print(f"  created {made} vn city translations")

    # re-apply grouping sort: en -> vn -> sk
    rows = api("GET", "/items/activities_translations?fields=id,activities_id,language&limit=-1")["data"]
    act_sort = {a["id"]: a["sort"] for a in acts}
    ranked = sorted(act_sort.items(), key=lambda kv: kv[1])
    rank = {aid: i for i, (aid, _) in enumerate(ranked)}
    n = len(ranked)
    sk = next(l["id"] for l in api("GET", "/items/languages?fields=id,code")["data"] if l["code"] == "sk")
    lang_base = {EN: 0, VN: n, sk: 2 * n}
    updates = [{"id": r["id"], "sort": lang_base[r["language"]] + rank[r["activities_id"]] + 1} for r in rows]
    api("PATCH", "/items/activities_translations", updates)
    print(f"  re-applied grouping sort on {len(updates)} rows (en -> vn -> sk)")


def main():
    print(f"vn language id = {VN}")
    print("\n== Page translations ==")
    page_translations()
    print("\n== City translations ==")
    city_translations()
    print("\n== Done ==")


if __name__ == "__main__":
    main()
