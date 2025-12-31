#!/bin/sh
PKG=package.json
if [ -f $PKG ]; then
  # Use jq if available, else fallback to node
  if command -v jq > /dev/null; then
    VER=$(jq -r .version $PKG)
    IFS='.' read -r major minor patch <<EOF
$VER
EOF
    patch=$((patch+1))
    NEW_VER="$major.$minor.$patch"
    jq ".version=\"$NEW_VER\"" $PKG > tmp.$$.json && mv tmp.$$.json $PKG
  else
    node -e "const f='package.json';const p=require('./'+f);let[v1,v2,v3]=p.version.split('.').map(Number);p.version=[v1,v2,++v3].join('.');require('fs').writeFileSync(f,JSON.stringify(p,null,2)+'\n')"
  fi
  git add $PKG
fi
