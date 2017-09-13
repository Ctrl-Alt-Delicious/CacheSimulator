# CS 2200 Cache Simulator
Copyright (c) 2017, Ctrl+Alt+Delicious (Ricky Barillas, Ryan Berst, Eduardo Mestanza, Kevin Rose, Will Thompson)

#### Run the two commands to start the application:
    <p>     npm install       (only the first time)
    <p>     npm start


## The development process
When developing this application there are certain routines that need to be followed to help ensure productivty and a clean stress-free dev process.

### Starting a feature
When starting a feature, you must checkout a new branch. Since all features are listed on our Zen Board it is easy to find a concise name for this branch since all issues are given a number. Creating a new branch should follow this pattern. `git checkout -b issue-<#> origin/master` where the placeholder `<#>` should be replaced with the issue number for the feature you are working on. Also note that the base for this new branch is `origin/master`, this way our new branch is the most up to date, so we need to fetch the lastest remote master first. In summary creating a new branch for some issue number 7 would look like this:

	git fetch
	git checkout -b issue-7 origin/master
	
	
### Working with a lot of commits
There is nothing wrong with making a lot of commits but sometimes it makes for a messy log and in complicated projects this means a messy dev process. One thing to overcome many commits is rebasing and squashing. I won't go over too many details of rebasing here since there are good resources online such as [this](http://gitready.com/advanced/2009/02/10/squashing-commits-with-rebase.html).

In short if you have a branch with many commits, some of which are part of the same idea, then squashing is for you and can be done by interactively rebasing such as this:

	git rebase -i HEAD~10
	
NOTE: If you do this after already pushing your branch to remote then you need to do a force push, `git push --force`. This is a scary command since it has the capability to undermine another person's work on the same remote branch. A safer alternative is to use `git push --force-with-lease`. For more info on why this is considered safer and a better alternative to `git push --force` please read [this](https://developer.atlassian.com/blog/2015/04/force-with-lease/)

### Getting ready for a Pull Request (PR)

So you wrote your code and it looks fine and dandy, good. You open up the app and the feature is doing what you expect, also good. But now we have to make sure our version control is good so the review process is stress free and clear.

It is the responsibility of the feature developer to make sure their branch is ready before making a PR and before asking for reviews, otherwise time might be wasted. First thing that needs to be ready is the acceptance criteria and steps to test (if relevant). The AC should be listed on the issue before working on the feature but if it is not update it at this time. Also add any screenshots or relevant info that will help the reviewer. If you are working on code that most likely has been touched since you initially created your branch then you need to update your branch and check for potential conflicts and changes in expected behavior (__most likely a front end feature__). What I'm going to suggest may or may seem contrary to what you are used to as far as updating your branch but hear me out. Before submitting a PR please `rebase`.

##### Rebase vs Merge
Rebasing your branch to `origin/master` (`git rebase origin/master`) will make it seem like you just checked out your branch from `origin/master` and did all your changes after it. Merging is different in the sense that it will take all the differences between `origin/master` and your feature branch and combine them in one commit and place it at the `HEAD` of your branch. This can create a messy git history and potentially make PR's harder to review since the "Files Changed" view in GitHub will have changes not introduced in the feature branch. For more info on this there are plenty of resources online but checkout [this](https://www.atlassian.com/git/tutorials/merging-vs-rebasing)

Now that you rebased you can make a PR. So go on GitHub and make the PR, read the files changed to make sure the changes are properly reflected and click that button to submit the PR. Also link the issue on ZenHub with the PR so the board will auto track. Finally ask for reviews in the #dev channel on slack on keep asking (politely) till someone claims responsibility for reviewing the PR. If you think someone in particular should review it for whatever reason ask them and explain why.

__TL;DR__

Before submitting a PR do the following

* Update AC and add relevant info
* `git fetch && git rebase origin/master`
* Create the PR on GitHub and review the files changed
* Link the issue from ZenHub to the PR
* Ask for reviews and keep asking till someone says they'll do it

### Reviewing a PR

You've been asked or volunteered to review a PR, cool. Let the developer of the PR know you are gonna review it and try and give some sort of timeline since the review process is cooperative. There are two main things you are reviewing in this process. The first is their code and the second is the acceptance criteria and big checking. I don't know if there is any particular order that these two things should be done so that’s up to your judgement.

#### Reviewing code

When reviewing code, you are checking for some things and you are not checking for other things. It’s easy to say what you aren't checking for. 

##### What _not_ to check for

You aren't checking for the most nit picky opinionated stuff that makes you seem more superior and makes their code seem like garbage. This isn't a competition in anyway so by being nit picky and annoying you aren't winning. Be respectful and remember we are all on the same team.

##### What _to_ check for

We are reviewing to make the code better than it already was or validate that it’s the best it’s gonna be. Every comment and review you make should be in the interest of better our code base and teaching other people new things. If you think that your comment is too nit-pick but it might help the developer learn something put it in the form of a suggestion not a dictation. For example, I've gotten this review many times

My code `assert len(some_list) == 0`

The review "Idiomatic Python says we should write that as `assert not some_list`"

When I first got this review, I was annoyed but then realized I just learned something neat and his review was written politely and informatively.

Also, when reviewing point out flaws in convention or style if it has been agreed upon within the group, we are our own police. 


#### Reviewing the acceptance criteria and checking for bugs

When reviewing the app itself we are checking to see that the issue has been solved in its entirety. The question we are asking is did it met the criteria of acceptance and did it introduce any bug. If the answer is "yes" and "no" then we are good. Otherwise this needs to be commented on in the PR, discussed with the developer, and potentially discussed with the team. Before we do this, we need to make sure we are seeing the app as if it were in production (merged with master). 

##### Preparing the code for app review

This is simple as you can just copy these commands and change the issue number accordingly. First, we need to update our repo with remote `git fetch` then we need to checkout a new branch that will be our review branch by basing it off of master `git checkout -b review origin/master`. Finally, we merge this with the feature branch `git merge origin/issue-<#>`. In summary for reviewing an issue numbered 7:

	git fetch
	git checkout -b review origin/master
	git merge origin/issue-7
	
Then you can review the app as if it were already merged with master.


