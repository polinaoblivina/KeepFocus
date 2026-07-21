FROM node:22-slim AS client-build
WORKDIR /src/keepfocus-client
COPY keepfocus-client/package.json keepfocus-client/package-lock.json ./
RUN npm install
COPY keepfocus-client/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS api-build
WORKDIR /src
COPY KeepFocus.Domain/KeepFocus.Domain.csproj KeepFocus.Domain/
COPY KeepFocus.Application/KeepFocus.Application.csproj KeepFocus.Application/
COPY KeepFocus.Infrastructure/KeepFocus.Infrastructure.csproj KeepFocus.Infrastructure/
COPY KeepFocus.WebAPI/KeepFocus.WebAPI.csproj KeepFocus.WebAPI/
RUN dotnet restore KeepFocus.WebAPI/KeepFocus.WebAPI.csproj

COPY KeepFocus.Domain/ KeepFocus.Domain/
COPY KeepFocus.Application/ KeepFocus.Application/
COPY KeepFocus.Infrastructure/ KeepFocus.Infrastructure/
COPY KeepFocus.WebAPI/ KeepFocus.WebAPI/
RUN dotnet publish KeepFocus.WebAPI/KeepFocus.WebAPI.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=api-build /app/publish .
COPY --from=client-build /src/keepfocus-client/dist ./wwwroot

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://+:${PORT:-8080} dotnet KeepFocus.WebAPI.dll"]
