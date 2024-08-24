cd apps/layer/nodejs || exit 0
npm install
esbuild --bundle --platform=node --sourcemap ../../lib/utils.ts --outdir=./node_modules "--external:moment"