#!/usr/bin/env python3
"""One-off migration: replace the 20 placeholder globe cities with the 5 real
photographed cities (Beijing, Shanghai, Jinan, Qingdao, Hong Kong), with
EN/SK/VN translations and real photos uploaded from the Tabernam/ folder.

Idempotency: photos are re-uploaded each run (fresh UUIDs); the kept activities
have their translations + photo links cleared and rewritten. Safe to re-run.
"""
import json
import os
import glob
import subprocess
import urllib.request
import urllib.error

URL = os.environ["DIRECTUS_URL"].rstrip("/")
TOKEN = os.environ["DIRECTUS_TOKEN"]
PHOTO_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "Tabernam")

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json",
}

# language ids in Directus: en=1, sk=2, vn=3
LANG = {"en": 1, "sk": 2, "vn": 3}


def api(method, path, body=None):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(URL + path, data=data, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw.strip() else None
    except urllib.error.HTTPError as e:
        print(f"  ! HTTP {e.code} on {method} {path}: {e.read().decode('utf-8')[:400]}")
        raise


def upload(path):
    """Upload one file via curl (multipart), return its UUID."""
    out = subprocess.run(
        ["curl", "-s", "-X", "POST", "-H", f"Authorization: Bearer {TOKEN}",
         "-F", f"file=@{path}", URL + "/files"],
        capture_output=True, text=True,
    )
    obj = json.loads(out.stdout)
    return obj["data"]["id"]


def photos_for(prefix):
    files = sorted(glob.glob(os.path.join(PHOTO_DIR, f"{prefix}-*.jpeg")))
    return files


# ---- content -------------------------------------------------------------
# Each city: kept activity id (or None to create), slug, lat, lng, altitude,
# sort, photo-file prefix, and translations per language.
CITIES = [
    {
        "id": 1, "slug": "beijing", "lat": 39.9042, "lng": 116.4074,
        "altitude": 1.7, "sort": 1, "prefix": "beijing",
        "tr": {
            "en": {"name": "Beijing", "business": "Beijing Partnership Office",
                   "description": "China's capital is where Tabernam opens doors at the highest level — official delegations, universities, and government partners. Every visit here is built on protocol, patience, and trust earned face to face."},
            "sk": {"name": "Peking", "business": "Partnerská kancelária Peking",
                   "description": "Čínske hlavné mesto je miestom, kde Tabernam otvára dvere na najvyššej úrovni — oficiálne delegácie, univerzity a vládni partneri. Každá návšteva tu stojí na protokole, trpezlivosti a dôvere získanej z očí do očí."},
            "vn": {"name": "Bắc Kinh", "business": "Văn phòng Đối tác Bắc Kinh",
                   "description": "Thủ đô của Trung Quốc là nơi Tabernam mở ra những cánh cửa ở cấp cao nhất — các đoàn đại biểu chính thức, trường đại học và đối tác chính phủ. Mỗi chuyến thăm nơi đây đều dựa trên nghi thức, sự kiên nhẫn và niềm tin được xây dựng qua từng cuộc gặp trực tiếp."},
        },
    },
    {
        "id": 2, "slug": "shanghai", "lat": 31.2304, "lng": 121.4737,
        "altitude": 1.7, "sort": 2, "prefix": "shanghai",
        "tr": {
            "en": {"name": "Shanghai", "business": "Shanghai Business & Academic Hub",
                   "description": "Shanghai is Tabernam's gateway to China's commercial and academic heart. From boardrooms to university halls like East China Normal University, this is where Slovak and European partners meet the pace of modern China."},
            "sk": {"name": "Šanghaj", "business": "Obchodné a akademické centrum Šanghaj",
                   "description": "Šanghaj je bránou Tabernam do obchodného a akademického srdca Číny. Od zasadacích miestností až po univerzitné sály, ako je Východočínska normálna univerzita, sa tu slovenskí a európski partneri stretávajú s tempom modernej Číny."},
            "vn": {"name": "Thượng Hải", "business": "Trung tâm Kinh doanh & Học thuật Thượng Hải",
                   "description": "Thượng Hải là cửa ngõ của Tabernam đến trung tâm thương mại và học thuật của Trung Quốc. Từ các phòng họp đến giảng đường đại học như Đại học Sư phạm Hoa Đông, đây là nơi các đối tác Slovakia và châu Âu hòa nhịp với nước Trung Quốc hiện đại."},
        },
    },
    {
        "id": None, "slug": "jinan", "lat": 36.6512, "lng": 117.1201,
        "altitude": 1.7, "sort": 3, "prefix": "jinan",
        "tr": {
            "en": {"name": "Jinan", "business": "Jinan Industrial Office",
                   "description": "In the industrial heartland of Shandong, Tabernam works hand in hand with China's manufacturing giants — from heavy-machinery leaders like Shantui to the engineers who build them. Jinan is where partnerships turn into production."},
            "sk": {"name": "Ťi-nan", "business": "Priemyselná kancelária Ťi-nan",
                   "description": "V priemyselnom srdci provincie Šan-tung spolupracuje Tabernam s čínskymi výrobnými gigantmi — od lídrov v ťažkom strojárstve, ako je Shantui, až po inžinierov, ktorí ich budujú. Ťi-nan je miestom, kde sa z partnerstiev stáva výroba."},
            "vn": {"name": "Tế Nam", "business": "Văn phòng Công nghiệp Tế Nam",
                   "description": "Tại trung tâm công nghiệp của tỉnh Sơn Đông, Tabernam hợp tác chặt chẽ với những tập đoàn sản xuất hàng đầu Trung Quốc — từ các nhà chế tạo máy móc hạng nặng như Shantui đến những kỹ sư tạo ra chúng. Tế Nam là nơi quan hệ đối tác trở thành sản xuất."},
        },
    },
    {
        "id": 18, "slug": "qingdao", "lat": 36.0671, "lng": 120.3826,
        "altitude": 1.7, "sort": 4, "prefix": "quingdao",  # folder spelled 'quingdao'
        "tr": {
            "en": {"name": "Qingdao", "business": "Qingdao Coastal Trade Office",
                   "description": "On the Yellow Sea coast, Qingdao blends port logistics, manufacturing, and an easy international air. For Tabernam it's a base for trade deals and the personal meetings that seal them."},
            "sk": {"name": "Čching-tao", "business": "Pobrežná obchodná kancelária Čching-tao",
                   "description": "Na pobreží Žltého mora spája Čching-tao prístavnú logistiku, výrobu a uvoľnenú medzinárodnú atmosféru. Pre Tabernam je základňou pre obchodné dohody a osobné stretnutia, ktoré ich spečatia."},
            "vn": {"name": "Thanh Đảo", "business": "Văn phòng Thương mại Ven biển Thanh Đảo",
                   "description": "Bên bờ Hoàng Hải, Thanh Đảo kết hợp hậu cần cảng biển, sản xuất và bầu không khí quốc tế thoải mái. Với Tabernam, đây là cơ sở cho các thỏa thuận thương mại và những cuộc gặp trực tiếp giúp hoàn tất chúng."},
        },
    },
    {
        "id": 19, "slug": "hong-kong", "lat": 22.3193, "lng": 114.1694,
        "altitude": 0.1, "sort": 5, "prefix": "hongkong",
        "tr": {
            "en": {"name": "Hong Kong", "business": "Hong Kong Gateway",
                   "description": "Hong Kong is where East meets West over a handshake. A world finance gateway and a stage for the galas and gatherings where Tabernam's relationships across Asia are forged and celebrated."},
            "sk": {"name": "Hongkong", "business": "Brána Hongkong",
                   "description": "Hongkong je miestom, kde sa Východ stretáva so Západom pri podaní ruky. Svetová finančná brána a javisko pre galavečery a stretnutia, na ktorých sa budujú a oslavujú vzťahy Tabernam naprieč Áziou."},
            "vn": {"name": "Hồng Kông", "business": "Cửa ngõ Hồng Kông",
                   "description": "Hồng Kông là nơi Đông và Tây gặp nhau qua một cái bắt tay. Một cửa ngõ tài chính của thế giới và là sân khấu cho những buổi gala và sự kiện nơi các mối quan hệ của Tabernam khắp châu Á được vun đắp và tôn vinh."},
        },
    },
]

# placeholder activity ids to delete (everything except kept 1,2,18,19)
DELETE_IDS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 20]


def clear_children(activity_id):
    """Delete existing translations and photo links for a kept activity."""
    tr = api("GET", f"/items/activities_translations?filter[activities_id][_eq]={activity_id}&fields=id&limit=-1")
    tr_ids = [r["id"] for r in tr["data"]]
    if tr_ids:
        api("DELETE", "/items/activities_translations", tr_ids)
    ph = api("GET", f"/items/activities_files?filter[activities_id][_eq]={activity_id}&fields=id&limit=-1")
    ph_ids = [r["id"] for r in ph["data"]]
    if ph_ids:
        api("DELETE", "/items/activities_files", ph_ids)
    print(f"  cleared {len(tr_ids)} translations, {len(ph_ids)} photo links")


def write_children(activity_id, city, uuids):
    for code, t in city["tr"].items():
        api("POST", "/items/activities_translations", {
            "activities_id": activity_id, "language": LANG[code],
            "name": t["name"], "business": t["business"], "description": t["description"],
        })
    for i, uid in enumerate(uuids):
        api("POST", "/items/activities_files", {
            "activities_id": activity_id, "directus_files_id": uid, "sort": i + 1,
        })
    print(f"  wrote 3 translations, {len(uuids)} photos")


def main():
    print("== Uploading photos ==")
    photo_uuids = {}
    for city in CITIES:
        files = photos_for(city["prefix"])
        if not files:
            print(f"  !! no photos found for prefix {city['prefix']}")
        uuids = []
        for f in files:
            uid = upload(f)
            uuids.append(uid)
        photo_uuids[city["slug"]] = uuids
        print(f"  {city['slug']}: uploaded {len(uuids)} photos")

    print("\n== Writing cities ==")
    for city in CITIES:
        uuids = photo_uuids[city["slug"]]
        if city["id"] is not None:
            aid = city["id"]
            print(f"- update {city['slug']} (id {aid})")
            api("PATCH", f"/items/activities/{aid}", {
                "slug": city["slug"], "lat": city["lat"], "lng": city["lng"],
                "altitude": city["altitude"], "sort": city["sort"],
            })
            clear_children(aid)
        else:
            print(f"- create {city['slug']}")
            created = api("POST", "/items/activities", {
                "slug": city["slug"], "lat": city["lat"], "lng": city["lng"],
                "altitude": city["altitude"], "sort": city["sort"],
            })
            aid = created["data"]["id"]
            print(f"  new id {aid}")
        write_children(aid, city, uuids)

    print("\n== Deleting placeholder cities ==")
    # only delete ids that still exist
    existing = api("GET", "/items/activities?fields=id&limit=-1")
    existing_ids = {r["id"] for r in existing["data"]}
    to_delete = [i for i in DELETE_IDS if i in existing_ids]
    if to_delete:
        api("DELETE", "/items/activities", to_delete)
    print(f"  deleted {len(to_delete)}: {to_delete}")

    print("\n== Done. Final city list ==")
    final = api("GET", "/items/activities?fields=id,sort,slug&sort=sort&limit=-1")
    for r in final["data"]:
        print(f"  {r['sort']:>2}  id={r['id']:<3} {r['slug']}")


if __name__ == "__main__":
    main()
