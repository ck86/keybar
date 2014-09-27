import os
import ssl
from email.utils import formatdate
from datetime import datetime
from time import mktime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'keybar.settings')

import django
django.setup()

from django.conf import settings
from httpsig.requests_auth import HTTPSignatureAuth
import requests

from keybar.models.user import User
from keybar.utils.crypto import _patch_ssl_for_tlsv12_default

_patch_ssl_for_tlsv12_default()

# TODO: Use a secret RSA key as secret.
secret = open('extras/example_keys/private_key.pem', 'rb').read()
user = User.objects.get(username='admin')

signature_headers = ['(request-target)', 'accept', 'date', 'host']

now = datetime.now()
stamp = mktime(now.timetuple())

headers = {
    'Host': 'keybar.local:8443',
    'Method': 'GET',
    'Path': '/api/v1/users/',
    'Accept': 'application/json',
    'X-Api-Key': user.api_key.hex,
    'Date': formatdate(timeval=stamp, localtime=False, usegmt=True)
}

auth = HTTPSignatureAuth(
    key_id=user.api_key.hex,
    secret=secret,
    headers=signature_headers,
    algorithm='rsa-sha256')


response = requests.get(
    'https://keybar.local:8443/api/v1/users/',
    auth=auth,
    headers=headers,
    verify=settings.KEYBAR_CA_BUNDLE)

print(response.content)
