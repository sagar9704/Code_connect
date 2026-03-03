#include <stdio.h>

// Function to calculate the factorial iteratively
long long calculateFactorial(int n) {
    // 0! and 1! are defined as 1
    if (n == 0 || n == 1) {
        return 1;
    }
    
    // Check for negative numbers (though input validation should handle this)
    if (n < 0) {
        return 0; // Return 0 to signal an error or invalid input
    }
    
    long long result = 1;
    
    // Multiply result by i from n down to 2
    for (int i = n; i >= 2; i--) {
        // Note: Factorials grow very fast. long long is used to handle values up to 20!
        result *= i; 
    }
    
    return result;
}

int main() {
    int num;
    
    printf("Enter a non-negative integer (up to 20): ");
    
    // Check if input reading was successful
    if (scanf("%d", &num) != 1) {
        printf("\n❌ Invalid input. Please enter a whole number.\n");
        return 1; // Exit with error
    }

    // Input validation checks
    if (num < 0) {
        printf("\n❌ Factorial is not defined for negative numbers.\n");
        return 1;
    }
    
    // We use 20 as the practical limit for a standard long long (64-bit) integer
    if (num > 20) {
        printf("\n⚠️ Warning: Calculating factorial for numbers > 20 exceeds the capacity of long long.\n");
        printf("Try a smaller number.\n");
        return 1;
    }

    long long factorial = calculateFactorial(num);
    
    printf("\nThe Factorial of %d is: %lld\n", num, factorial);

    return 0; // Exit successfully
}