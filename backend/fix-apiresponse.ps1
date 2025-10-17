# Script to fix ApiResponse parameter order
# From: new ApiResponse(statusCode, data, message)
# To: new ApiResponse(statusCode, message, data)

$controllers = @(
    "src/controllers/order.controller.js",
    "src/controllers/payment.controller.js",
    "src/controllers/review.controller.js",
    "src/controllers/report.controller.js",
    "src/controllers/admin.controller.js"
)

foreach ($file in $controllers) {
    Write-Host "Processing $file..."
    
    $content = Get-Content $file -Raw
    
    # Pattern: new ApiResponse(statusCode, variable/object, "string")
    # We need to swap the last two parameters
    
    # Replace patterns like: new ApiResponse(200, data, "message")
    $content = $content -replace 'new ApiResponse\((\d+),\s*([a-zA-Z_][a-zA-Z0-9_]*),\s*"([^"]+)"\)', 'new ApiResponse($1, "$3", $2)'
    
    # Replace patterns like: new ApiResponse(200, { ... }, "message") - multi-line
    # This is more complex, so we'll handle specific cases
    
    Set-Content $file -Value $content -NoNewline
    Write-Host "Fixed $file"
}

Write-Host "Done!"
