#!/bin/bash

# Translation Update Script
# This script updates all translation files based on English source files
# Usage: ./update-translations.sh [languages]
# Example: ./update-translations.sh "es pt fr de"

# set -e  # Exit on any error - commented out for debugging

# Configuration
API_KEY="AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw"
DEFAULT_LANGUAGES="es,pt,fr,de,ar,fa,hi,id,it,ja,ko,my,nl,ru,th,tr,ur,vi,zh"
LANGUAGES=${1:-$DEFAULT_LANGUAGES}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if tr_file command exists
if ! command -v tr_file &> /dev/null; then
    print_error "tr_file command not found. Please install it first."
    exit 1
fi

print_status "Starting translation update process..."
print_status "Target languages: $LANGUAGES"
print_status "Using API key: ${API_KEY:0:10}..."

# Counter for statistics
total_files=0
successful_translations=0
failed_translations=0

# Find all English translation files
print_status "Scanning for English translation files..."

while IFS= read -r -d '' english_file; do
    # Convert absolute path to relative path
    relative_path="${english_file#./}"
    
    # Skip if file doesn't exist or is empty
    if [[ ! -f "$english_file" ]] || [[ ! -s "$english_file" ]]; then
        print_warning "Skipping empty or non-existent file: $relative_path"
        continue
    fi
    
    print_status "Processing: $relative_path"
    ((total_files++))
    
    # Extract directory and base filename
    file_dir=$(dirname "$relative_path")
    base_name=$(basename "$relative_path" .json)
    
    # Change to the file's directory to run tr_file (it creates files in current dir)
    print_status "  -> Changing to directory: $file_dir"
    cd "$file_dir" || {
        print_error "    ✗ Failed to change to directory: $file_dir"
        continue
    }
    
    # Process each target language
    for lang in $LANGUAGES; do
        print_status "  -> Translating to $lang"
        print_status "    Current directory: $(pwd)"
        print_status "    Running: tr_file -k [API_KEY] $(basename "$relative_path") $lang"
        
        # Run the translation command
        if tr_file -k "$API_KEY" "$(basename "$relative_path")" "$lang"; then
            # tr_file creates files like "es.json" in current directory
            generated_file="$lang.json"
            
            if [[ -f "$generated_file" ]]; then
                print_success "    ✓ Successfully translated to $lang"
                print_status "    ✓ File created: $generated_file"
                ((successful_translations++))
            else
                print_error "    ✗ Translation file not created for $lang"
                print_error "    Expected file: $generated_file"
                print_status "    Files in directory: $(ls -la)"
                ((failed_translations++))
            fi
        else
            print_error "    ✗ Failed to translate to $lang"
            ((failed_translations++))
        fi
        
        # Small delay to avoid rate limiting
        sleep 1
    done
    
    # Return to root directory
    cd - > /dev/null
    
    echo "" # Empty line for readability
    
done < <(find i18n -name "*en.json" -type f -print0)

# Print summary
echo ""
print_status "=== Translation Update Summary ==="
print_status "Total English files processed: $total_files"
print_success "Successful translations: $successful_translations"
if [[ $failed_translations -gt 0 ]]; then
    print_error "Failed translations: $failed_translations"
else
    print_success "Failed translations: $failed_translations"
fi

if [[ $failed_translations -gt 0 ]]; then
    print_warning "Some translations failed. Please check the output above for details."
    exit 1
else
    print_success "All translations completed successfully!"
fi
