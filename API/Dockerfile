FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["API/API.csproj", "API/"]
RUN dotnet restore "API/API.csproj"
COPY . .
WORKDIR "/src/API"
RUN dotnet build "API.csproj" -c Release -o /app/build
RUN dotnet tool install --global dotnet-ef --version 8.0.5
ENV PATH="${PATH}:/root/.dotnet/tools"

FROM build AS publish
RUN dotnet publish "API.csproj" -c Release -o /app/publish

# Use SDK instead of runtime for final image
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
# Install EF tools in final image
RUN dotnet tool install --global dotnet-ef --version 8.0.5
ENV PATH="${PATH}:/root/.dotnet/tools"

ENTRYPOINT ["dotnet", "API.dll"]