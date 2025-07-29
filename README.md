# chatgpt-navigator

### Overview

Chatgpt-navigator is a navigation tool that lets you go up and down conersations in a chat. This is ideal for long conversations with chatgpt. It has four buttons - top, up, down, bottom. Whatever current conversation you are in, up and down lets you go to the previous and next conversations. Top and bottom lets you go to the first and last conversations 

### Folder information

- icons/ - contains icons
- chatgpt.js - responsible for the whole logic. The logic is as follows :
    1. Inject UI.
    2. Make a conversation array. Attach the buttons to the elements of the array. 
    3. Track currentIdx of the array based on bounding rectangle. Add logic for setupScrollTracking (track based upon the current conversation on the screen after sroll).
    4. Create an observer to track new conversations.
    5. Another major portion of the logic includes re-injecting the whole logic whenever conversation changes (via back button or by clicking on the different chats) or user goes to other conversation agent within chatgpt.

- url_change.js - it contains the logic for handling url change and reinjecting the navigator code. The problem I faced was trying to inject before DOM is loaded or unable to reinject when I am changing to different url via history. (I am writing this 1.5 months later so I really don't remember the reasons for the problems :( )

### How the injection works?

If initalizeNavigator() is called - cleanup all the code, including any observer, any listeners, etc. If observer exists, we disconnect and create a new one. Before creating a new one, we wait for the DOM to load. Using isDOMLoaded (the inbuild function) would be faulty, because the container are static and loaded instantly but the conversations and chats takes time. So I am tracking that rather than the DOM. Inject the UI. Connect the buttons. Setup the scroll tracking. Then, track the container element using observer.

I am using IIFE to avoid any clash of variables, but the frontend code that you could see using console is solid :). No way any variable clash :).


### How to use locally?

1. Download the files.
2. Go to chrome://extensions.
3. Switch on developer mode.
4. Click Load unpacked and upload the folder.
DONE!!!



### Future Plans
1. Extend to other AI chat tools to have the same purpose.
2. Add a stop functionality to stop the automatic scroll when followup questions are asked. 
3. Zooming in causes the floating UI to enlarge as well. Resolve.
4. Add a history button, to go fro and back conversations

Please feel free to contribute according to Future Plans or otherwise. You can contact me using my socials. Find it on my profile. 😄