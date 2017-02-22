# // TODO: This is mostly just the quickstart....
# // This needs to be reafactored with the functionality in ./extra/mysql2mongo.py
# // https://github.com/google/google-api-python-client/

from __future__ import print_function
import os, sys
import httplib2
from apiclient import discovery
from apiclient import errors
import oauth2client
from oauth2client import client
from oauth2client import tools

try:
    import argparse
    flags = argparse.ArgumentParser(parents=[tools.argparser]).parse_args()
    flags.noauth_local_webserver = True
except ImportError:
    flags = None

import json
with open('package.json') as data:
    pkg = json.load(data)

SCRIPT_ID = CLIENT_SECRET = APPLICATION_NAME = CREDENTIAL_PATH = None

APPLICATION_NAME = "{0} ({1}-v{2})".format(pkg['description'], pkg['name'], pkg['version'])

path = pkg['config']['config_dir']
dirs = os.listdir(path)
for file in dirs:
    file = os.path.join(path, file)
    if file.endswith('script.id'):
        with open(file, 'r') as data:
            SCRIPT_ID = data.read()
    if file.endswith('auth_secret'):
        CLIENT_SECRET = file

# base_path = os.path.expanduser('~')   # original user home dir
base_path = os.path.dirname(os.path.realpath(__file__))  # modified project home dir
result = os.path.join(base_path, pkg['config']['credential_dir'])
if not os.path.exists(result):
    os.makedirs(result)
CREDENTIAL_PATH = os.path.join(result, "{0}.json".format(__file__.replace('.', '-')))
SCOPES = ' '.join(pkg['config']['scopes'])
# print (SCRIPT_ID, CLIENT_SECRET, APPLICATION_NAME, CREDENTIAL_PATH, SCOPES)
# import sys
# sys.exit()


def get_credentials():
    """Gets valid user credentials from storage.

    If nothing has been stored, or if the stored credentials are invalid,
    the OAuth2 flow is completed to obtain the new credentials.

    Returns:
        Credentials, the obtained credential.
    """
    store = oauth2client.file.Storage(CREDENTIAL_PATH)
    credentials = store.get()
    if not credentials or credentials.invalid:
        flow = client.flow_from_clientsecrets(CLIENT_SECRET, SCOPES)
        flow.user_agent = APPLICATION_NAME
        if flags:
            credentials = tools.run_flow(flow, store, flags)
        else:  # Needed only for compatibility with Python 2.6
            credentials = tools.run(flow, store)
        print('Storing credentials to ' + CREDENTIAL_PATH)
    return credentials


def display_error(response):
    """Displays the error results and stacktrace for an unsuccessful request

    Displays the error results and stacktrace for an unsuccessful request
    """
    # The API executed, but the script returned an error.

    # Extract the first (and only) set of error details. The values of
    # this object are the script's 'errorMessage' and 'errorType', and
    # an list of stack trace elements.
    error = response['error']['details'][0]
    print("Script error message: {0}".format(error['errorMessage']))

    if 'scriptStackTraceElements' in error:
        # There may not be a stacktrace if the script didn't start
        # executing.
        print("Script error stacktrace:")
        for trace in error['scriptStackTraceElements']:
            print("\t{0}: {1}".format(trace['function'],
                trace['lineNumber']))


def get_service():
    credentials = get_credentials()
    http = credentials.authorize(httplib2.Http())
    service = discovery.build('script', 'v1', http=http)
    return service


def encode_result(response):
    results = response['response'].get('result', {})
    return json.dumps(results)


def execute(request, callback):
    if ((not CLIENT_SECRET) or (not os.path.isfile(CLIENT_SECRET)) or (os.path.getsize(CLIENT_SECRET) < 23)):
        print("auth_secret must exist and must not be empty")
        sys.exit(404)

    if ((not SCRIPT_ID) or len(SCRIPT_ID) < 42):
        print("script.id must exist and must not be empty ")
        sys.exit(404)

    service = get_service()
    try:
        response = service.scripts().run(body=request, scriptId=SCRIPT_ID).execute()

        if 'error' in response:
            display_error(response)
        else:
            return callback(response)

    except errors.HttpError as e:
        # The API encountered a problem before the script started executing.
        print(e.content)


# --------------------
def addContactToGroup(person):
    request = {"function": "addContactToGroup", "parameters": [person]}
    return execute(request, encode_result)


def addContactToGroupByName(first_name, last_name, email, group_name):
    request = {"function": "addContactToGroup", "parameters":
        [{"f": first_name, "l": last_name, "e": email, "g": group_name}]}
    return execute(request, encode_result)


def getContactList(group_name):
    request = {"function": "getContactList", "parameters": [{"g": group_name}]}
    return execute(request, encode_result)


def addGroup(group_name):
    request = {"function": "addGroup", "parameters": [{"g": group_name}]}
    return execute(request, encode_result)


def main():
    # default function to verify configuration
    print(getContactList('2011 South Calgary Garden'))


if __name__ == '__main__':
    main()
