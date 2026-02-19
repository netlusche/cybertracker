#!/bin/bash
git status > status.txt
git branch -a >> status.txt
git remote -v >> status.txt
git log -n 5 >> status.txt
