FROM node:lts-alpine as build
WORKDIR /app
COPY . .
RUN rm -rf ./node_modules && npm install && npm run build

FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
