#!/bin/bash
set -e

echo "🛠️  Ejecutando build de Nuxt..."
#npm run build

# Guardar rama actual
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
BUILD_BRANCH="build"

# Crear carpeta temporal sin usar /tmp
TMP_DIR=".deploy_temp"
rm -rf "$TMP_DIR"
mkdir "$TMP_DIR"

echo "📦 Copiando .output (sin symlinks) al directorio temporal..."
cd .output
find . -type f -exec cp --parents {} "../$TMP_DIR" \;
cd ..

echo "📁 Copiando ecosystem.config.js al directorio temporal..."
cp ecosystem.config.js "$TMP_DIR"

echo "🚀 Cambiando a rama $BUILD_BRANCH..."
if git show-ref --quiet refs/heads/$BUILD_BRANCH; then
  git checkout $BUILD_BRANCH
else
  git checkout -b $BUILD_BRANCH
fi

# Eliminar todos los archivos excepto .git
echo "🧹 Limpiando archivos anteriores..."
find . -mindepth 1 -not -name ".git" -exec rm -rf {} +

# Copiar desde carpeta temporal
echo "📂 Copiando archivos de despliegue..."
cp -r "$TMP_DIR"/. .

# Commit y push
echo "📤 Subiendo cambios..."
git add .
git commit -m "Deploy SSR build output"
git push origin $BUILD_BRANCH

# Volver a la rama anterior
git checkout "$CURRENT_BRANCH"

# Limpiar
rm -rf "$TMP_DIR"

echo "✅ Despliegue completado correctamente en la rama '$BUILD_BRANCH'"