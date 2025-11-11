#!/bin/bash
# TIEMPO-339: Enable Next Cypress Test Script
#
# Finds the first test with .skip() and removes it
# Returns exit code 0 if a test was enabled
# Returns exit code 1 if no more tests to enable

set -e

echo "🔍 Searching for next skipped test..."

# Find all .cy.js files with .skip()
SKIPPED_FILES=$(grep -rl "it\.skip(" cypress/e2e/ | sort)

if [ -z "$SKIPPED_FILES" ]; then
  echo "🎉 No more skipped tests found!"
  exit 1
fi

echo "📁 Found files with skipped tests:"
echo "$SKIPPED_FILES"

# Process first file with skipped tests
FIRST_FILE=$(echo "$SKIPPED_FILES" | head -n 1)
echo ""
echo "📝 Processing: $FIRST_FILE"

# Find first occurrence of it.skip( in the file
LINE_NUM=$(grep -n "it\.skip(" "$FIRST_FILE" | head -n 1 | cut -d: -f1)

if [ -z "$LINE_NUM" ]; then
  echo "❌ Error: Could not find .skip() in $FIRST_FILE"
  exit 1
fi

echo "📍 Found .skip() at line $LINE_NUM"

# Get the test name for logging
TEST_NAME=$(sed -n "${LINE_NUM}p" "$FIRST_FILE" | sed "s/.*it\.skip(['\"]//;s/['\"].*//" | head -c 60)
echo "🧪 Test: $TEST_NAME"

# Remove .skip from that line using sed
# This handles both it.skip(' and it.skip("
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS sed requires empty string after -i
  sed -i '' "${LINE_NUM}s/it\.skip(/it(/" "$FIRST_FILE"
else
  # Linux sed
  sed -i "${LINE_NUM}s/it\.skip(/it(/" "$FIRST_FILE"
fi

# Verify the change
if grep -q "it\.skip(" "$FIRST_FILE" | head -n 1; then
  REMAINING=$(grep -c "it\.skip(" "$FIRST_FILE" || echo "0")
  echo "✅ Enabled test: $TEST_NAME"
  echo "📊 Remaining skipped tests in this file: $REMAINING"
else
  echo "✅ Enabled last skipped test in $FIRST_FILE"
fi

echo ""
echo "🎯 Changes made to: $FIRST_FILE"
echo "✅ Ready to commit and test!"

exit 0
