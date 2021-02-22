## Overview 
Juego is spanish for game. Fool your colleagues with your lies, avoid theirs, and find the truth with this fun and engaging app for Slack. This is a fun app to help you stay connected and keep your colleagues engaged while lowering the barrier of entry into Slack.

## How it works
![how it works screen shot](https://raw.githubusercontent.com/dannyhostetler/slack-fibbage/main/media/screen-1.png)

## Implementation
In order to implement this app, you will need to host the NodeJS application derived from this project along with a number of API endpoints (outlined below).

### 1. Create a Slack app
* [Create a new Slack app](https://api.slack.com/apps)
* __Configure OAuth & Permissions__: In the app's settings, select __OAuth & Permissions__ from the left navigation. 

  * Scroll down to the section titled Scopes and add the following __Bot Token Scopes__: `chat:write`, `chat:write.public`, `commands`, and `users:read`.
  * _For distributed apps only._ Click __Add New Redirect URL__, enter your redirect URL, then __Add__.
  
* __Enable Interactivity & Shortcuts__: In the app's settings, select __Interactivity & Shortcuts__ from the left navigation. Toggle the __Interactivy__ setting to On.

  * Add a valid __Request URL__
  * Click __Create New Shortcut__ with the following details:

    * Name: Start a game of Juego
    * Short Description: Juego is a fun game of lies.
    * Callback ID: start_game
    
* __Enable Event Subscriptions__: In the app's settings, select __Event Subscriptions__ from the left navigation. Toggle the __Enable Events__ setting to On.

  * Add a valid __Request URL__
  * Scoll down to the section title __Subscribe to bot events__ and click __Add Bot User Event__
  
    * Subscribe to the `app_home_opened` event
    
* __Enable App Home__: By default the App Home surface is disabled. In the app's settings, select __App Home__ from the left navigation.

  * Scroll down to the section titled Show Tabs and enable the Home Tab and Messages Tab
 
* __Install App__: In the app's settings, select __Install App__ from the left navigation. Click on Install to Workspace