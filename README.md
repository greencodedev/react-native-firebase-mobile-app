This project is based on React Native, mobx, chart, google map APIs, Firebase.
And this project is based on Expo.io.

## Instructions

### Getting Started

1. Clone the repository

		git clone https://github.com/greencodedev/react-native-firebase-mobile-app.git
	
2. Change directory to `react-native-firebase-mobile-app`
	
		cd react-native-firebase-mobile-app
	
3. Install npm packages by using `yarn` or `npm`

		yarn (install)
		npm install
	
4. Run the project by following command

		expo start
		
		
### Add a feature

1. Create your own branch

		git checkout -b [branch_name]

2. Write the codes
3. Push the codes to Gitlab ***(don't change the branch)***

**NOTE**: *You can create a new branch each time you are working on a new feature or milestone.*

### Sync your branch

In order to keep up with the *`master`* branch, you should always sync your branch with it. To do that, do the following steps:

1. `pull` the latest code from your branch:

		git pull

1. `pull` the latest code from *`master`* branch:

		git checkout master
		git pull
		
2. `rebase` your branch with *`master`*

		git checkout [branch_name]
		git rebase master

**NOTE**: *To find out more about the differences between `merge` and `rebase` check out [this](https://www.youtube.com/watch?v=TymF3DpidJ8) video.*

**SOURCE**: [Stackoverflow | How to keep a git branch in sync with master](https://stackoverflow.com/questions/16329776/how-to-keep-a-git-branch-in-sync-with-master)

## Resources

1. [Pro Git Book](https://git-scm.com/book/en/v2) 

## Todos

1. Styling guidance
2. Prerequsites
3. Issue template and guidance

=================================================

# git tricks:

#### 1. If you can't see all the branches by `git branch -a`, then:
The problem can be seen when checking the remote.origin.fetch setting
(The lines starting with $ are bash prompts with the commands I typed. The other lines are the resulting output)

	git config --get remote.origin.fetch
	> +refs/heads/master:refs/remotes/origin/master

As you can see, in my case, the remote was set to fetch the master branch specifically and only. I fixed it as per below, including the second command to check the results.

	git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
	git config --get remote.origin.fetch
	> +refs/heads/*:refs/remotes/origin/*

### 2. To see logs from another branch without checking out that branch you can:
	git log master..branchname
If your branch was made off of origin/master, then say origin/master instead of master

### 3. Stash
    git stash
    git stash list   
    git stash apply stash@{2}
    git stash drop stash@{0}
    git stash pop
    git stash show -p stash@{0} | git apply -R    (un-apply lastest stash in this case)
    git stash branch testchanges
    
### 4. Suggested branch name convention

    wip       Works in progress; stuff I know won't be finished soon
    feat      Feature I'm adding or expanding
    bug       Bug fix or experiment
    junk      Throwaway branch created to experiment
    
### 5. To check if there is any update / or any branch is behind
    
    git remote -v update

    git for-each-ref --format="%(refname:short) %(upstream:track)" refs/heads

### 6. To list of files changed in one commit compare to the previous commit 

    git show --stat --oneline COMMIThash

### 7. To sort list of branches by date 

    git branch -v -a --sort=committerdate

### 8. Delete the last pushed commit in origin
    git reset HEAD^ --hard   (First reset the branch to the parent of the current commit)
    git push https://gitlab.com/bkamrani/onrun-client -f      (Then force-push it to the remote)

### 9. Delete the local and remote branches (note: they are different objects!)
    git branch -d <branch_name>                    [local branch]
    git push <remote_name> --delete <branch_name>  [remote branch] remote_name is often: origin
    - Don't forget to do a git fetch --all --prune on other machines after deleting the remote branch on the server

### 10. Force a pull from remote to local branch
    git reset --hard origin/master
    git reset --hard origin/<branch_name>       [OR If you are on some other branch]



## Build issues

### make sure of the node version (node -v). Current node version is: 10.16.3  
https://nodejs.org/en/download/

### do a full clean up
watchman watch-del-all && rm -rf $TMPDIR/react-native-packager-cache-* && rm -rf $TMPDIR/metro-bundler-cache-* && rm -rf node_modules/ && yarn cache clean && yarn install && yarn start -- --reset-cache


#### try to upgrade the yarn
yarn cache clean && yarn upgrade && yarn

#### issues with upgrading expo client 
sudo npm install -g --unsafe-perm expo-cli

=================================================


# Publishing:

### iOS Test Flight 
**To build:**
expo build:ios

**To upload:**
expo upload:ios --apple-id bkamrani@gmail.com --apple-id-password afeq-ixah-hqbl-nxde --app-name onRun --sku com.app.onrun --language English

### Android 
expo build:android -t app-bundle

### List of available builds
expo build:list  

### Expo help
expo --help
