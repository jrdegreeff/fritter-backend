# sets up demo branches locally in your repo
# because GitHub Classroom clones each branch of the template
# repo independently, without preserving commit history

git checkout main
git checkout -b view-demo
git checkout origin/view-demo-code -- .
git commit -m "demo: add view concept"

git checkout main

# run this after if everything looks good!
# git push --all origin