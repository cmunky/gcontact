
## Google Contacts Integration (gcontact)

This project consists of two installable software libaries to integrate a web application with Google Contacts.

This requires a Google account to host the integration library and provide endpoint authentication services.

The library is installed as a 'Google Apps Script' document on Google Drive.

The Apps Script document is also used to generate the required credentials for the integration.

There is also a plugin like architecture available for Google Drive that may be a more suitable contatiner for this library moving forward.

Installing the bindings for common web applications involves building an installable package that can be implemented as a component of the web application.

There are bindings for PHP, Python and Javascript, however only the PHP is currently production ready.

It is expected that users of this library are familiar with one or more programming languages and have a solid understanding of the Google OAuth flows to install and configure this integration.

### -- Installation -- 

The development environment for this project requires node + npm
It also assumes that git is available, however it is not strictly require

Get and install node + npm, if you haven't already done so

Install the gcontact project source

`run npm install to install the project dependencies`

> If you don't have git installed, you will need to install the google-api-php-client library manually
> 
> The .zip archive can be found here: https://github.com/google/google-api-php-client/archive/v1-master.zip

Login to the Google account which will host the integration libary

Navigate to Google Drive, click the [NEW] button, then select the 'More >' option

Look for a 'Google Apps Script' menu option in the resulting menu

If it doesn't exist, you will need to enable 'Google Apps Script' files for this account

Click the Gear Icon (settings) at far right of screen

Click on 'Manage Apps' and then click 'Connect more apps' link

Type Apps Script in the search bar and it should be the first result

Click the [+ CONNECT] button to connect the 'Google Apps Script' app to Google Drive 

Select the 'Google Apps Script' menu choice and a new tab should open as an Untitled project

It is important to give this project a useful name and save those changes.

It is suggested the document be named 'Google Contacts Integration (gcontact)' to clarity and consistency.

After the file has been named and the changes saved, you must copy the URL and save that somewhere for future use

Alternatively, you could select File -> Project Properties and just save the 'Script ID' value as that is all that is really required

Next, click the 'Resources' menu and select 'Developers Console Project'

In the resulting dialog, click the link to the 'project' this script is currently associated with.

This will open another tab containing the Google API Manager

On the left side of the page, click on the [Credentials] menu choice

You should now have a page displaying a single OAuth 2.0 client ID - It should be named 'Apps Script' and be of type 'Web Application'

Click the [Create credentials] button near the top of the page

Select OAuth client ID from the resulting menu

Select 'Other' radio button and provide a useful name for the credentals

Naming the credentials 'Google Contacts Integration (gcontact)' is again suggested for clarity and consistency.

Click on the name of the credential you just created to have the details of that credential displayed.

Click the [Download JSON] button and the credentials will be saved to wherever your browser puts downloaded files

Still on the tab containing the Google API Manager

On the left side of the page, click on the [Library] menu choice

On the page that appears, type 'Apps Script' in the search edit field and it should be the first result

Click on Google Apps Script Execution API link, and then click the 'Enable' button on the resultin page

You have now configured the libary host file and generated the credentials to interoperate with the Google account

Celebrate if you must, but we are not done yet...

Now we turn our attention to configuring the development environment to interact with the Google account

The installation process installed a task runner to make this task a bit simpler

`run grunt config_script <script-id>`

This will create a configuration file containing script id provided

`run grung config_auth <path-to-json-credentials-file>`

This will copy the credentials file to our local configuration path

`run grunt auth `

This will attempt to authenticate the OAuth key with Google 

-   This will likely have more steps
-   We will need to navigate to an auth page, grant permissions, 
-   and then copy the resulting response key back into our configuration


> `git clone -b v1-master https://github.com/google/google-api-php-client.git`
> `https://github.com/google/google-api-php-client/archive/v1-master.zip`

#### TODO - Move this to another file !!!

- [ ] additional tasks and aliases required to build an installable PHP archive
- [ ] update and test the 'gardens' implementation of the PHP gcontact library
- [ ] additional testing of the installation process described in the README
- [ ] proof read and refine the README document
- [ ] gather screencaps for the installation process, crop and annotate, include in README
- [ ] design and implement an installable Python gcontact library
- [ ] design and implement an installable Javascript gcontact library
- [ ] determine what to do with the mysql3mongo.py script... why is it in this project?
- [ ] consider and research an OAuth flow that can be integrated with a web application
  * the use case here is to allow the 'gardens' admins to authorize a new token from an SPA
- [ ] build out test harness to exercise library bindings
