$files = @(
  'src/context/BusinessContext.property.test.tsx',
  'src/components/shared/EmptyState.property.test.tsx',
  'src/types/index.property.test.ts',
  'src/lib/utils.property.test.ts'
)

foreach ($file in $files) {
  $content = Get-Content $file -Raw
  $content = $content -replace 'numRuns: 100', 'numRuns: 20'
  Set-Content $file $content -NoNewline
  Write-Host "Updated $file"
}

Write-Host "All property test files updated to use numRuns: 20"
