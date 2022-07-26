FROM node:16.16.0-slim as build
WORKDIR /app
COPY . .
RUN rm -rf ./node_modules && yarn && yarn build

FROM nginx:1.23.0-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE REACT_APP_BACKEND_DOMAIN='http://localhost:5000' 
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
