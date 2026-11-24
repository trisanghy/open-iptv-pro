#!/usr/bin/env python3
"""Verify a signed TV WGT's XML signatures and packaged payload.

Requires ``python3 -m pip install lxml xmlsec cryptography``. Certificate trust and Samsung
device authorization are enforced by the TV at install time, not by this tool.
"""

import argparse
import base64
import hashlib
import io
import pathlib
import sys
import urllib.parse
import xml.etree.ElementTree as ET
import zipfile

try:
    from lxml import etree
    import xmlsec
    from cryptography import x509
except ImportError as exc:
    raise SystemExit("Cần cài thư viện: python3 -m pip install lxml xmlsec cryptography") from exc


DS = "{http://www.w3.org/2000/09/xmldsig#}"
SIGNATURES = ("author-signature.xml", "signature1.xml")
REQUIRED = {"config.xml", "index.html", "hls.min.js", "dash.all.min.js", "mpegts.min.js"}


def verify(filename: pathlib.Path, version: str, product: bool) -> None:
    with zipfile.ZipFile(filename) as archive:
        infos = archive.infolist()
        names = [i.filename for i in infos if not i.is_dir()]
        files = set(names)
        assert len(files) == len(names), "Tên file trùng nhau trong WGT"
        assert {"config.xml"} | set(SIGNATURES) <= files, "Thiếu manifest hoặc chữ ký WGT"
        if product:
            assert REQUIRED <= files, "Thiếu engine phát hoặc giao diện trong WGT"
        assert archive.testzip() is None, "WGT bị lỗi ZIP"
        for name in names:
            path = pathlib.PurePosixPath(name)
            assert not path.is_absolute() and ".." not in path.parts and "\\" not in name, "Đường dẫn không an toàn"
        root = ET.fromstring(archive.read("config.xml"))
        assert root.attrib["version"] == version, "Sai phiên bản WGT"
        if product:
            assert "webapis.avplay" in archive.read("index.html").decode("utf-8"), "Thiếu AVPlay"
            t = "{http://tizen.org/ns/widgets}"
            assert root.find(t + "profile").attrib["name"] == "tv-samsung", "Sai profile TV"
            app = root.find(t + "application")
            assert app.attrib["id"] == "OIPTVPROTV.OpenIPTVPro", "Sai application ID"
            assert tuple(map(int, app.attrib["required_version"].split("."))) <= (6, 0), "Yêu cầu Tizen cao hơn 6"
            privileges = {p.attrib["name"] for p in root.findall(t + "privilege")}
            assert {"http://tizen.org/privilege/internet", "http://tizen.org/privilege/tv.inputdevice"} <= privileges

        # xmlsec must read only members of this ZIP. Never allow its default
        # file/network handlers to dereference attacker-controlled XML URIs.
        xmlsec.cleanup_callbacks()

        def member(uri: bytes) -> str:
            value = urllib.parse.unquote(uri.decode("utf-8"))
            assert value in files and not value.startswith("/"), "URI ngoài WGT"
            return value

        xmlsec.register_callbacks(
            lambda uri: member(uri) in files,
            lambda uri: io.BytesIO(archive.read(member(uri))),
            lambda context, buffer: context.readinto(buffer),
            lambda context: context.close(),
        )

        payload = files - set(SIGNATURES)
        for signature_name in SIGNATURES:
            document = etree.fromstring(archive.read(signature_name))
            signed_info = document.find(DS + "SignedInfo")
            certificates = document.findall(".//" + DS + "X509Certificate")
            assert signed_info is not None and certificates, "Chữ ký không có chứng chỉ"
            refs = [ref.get("URI") for ref in signed_info.findall(DS + "Reference")]
            members = [member(ref.encode()) for ref in refs if ref and not ref.startswith("#")]
            expected = payload | ({"author-signature.xml"} if signature_name == "signature1.xml" else set())
            assert set(members) == expected and len(members) == len(expected), "Chữ ký không bao phủ đủ WGT"
            assert refs.count("#prop") == 1, "Thiếu SignedProperties"
            cert = base64.b64decode("".join(certificates[0].text.split()), validate=True)
            if product and signature_name == "signature1.xml":
                issuer = x509.load_der_x509_certificate(cert).issuer.rfc4514_string()
                assert "Samsung Electronics" in issuer, "Distributor không do Samsung CA cấp"
            context = xmlsec.SignatureContext()
            context.key = xmlsec.Key.from_memory(cert, xmlsec.KeyFormat.CERT_DER, None)
            # The ZIP callback is the only registered IO handler; the URI
            # classifier treats relative members as generic URIs.
            context.enabled_reference_uris = xmlsec.constants.TransformUriTypeAny
            xmlsec.tree.add_ids(document, ["Id"])
            context.verify(document)
            print(f"PASS: {signature_name}: chữ ký số và toàn bộ payload")

        print(f"PASS: WGT {version}, {len(payload)} file nội dung; SHA256: {hashlib.sha256(filename.read_bytes()).hexdigest()}")
        print("Chưa xác minh chuỗi tin cậy Samsung, DUID hoặc cài đặt trên TV thật.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("wgt", type=pathlib.Path)
    parser.add_argument("--version", default="0.1.52")
    parser.add_argument("--product", action="store_true")
    args = parser.parse_args()
    try:
        verify(args.wgt, args.version, args.product)
    except (AssertionError, ValueError, KeyError, zipfile.BadZipFile, xmlsec.Error) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        sys.exit(1)
