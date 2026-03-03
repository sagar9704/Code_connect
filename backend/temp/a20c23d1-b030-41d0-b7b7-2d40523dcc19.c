#include <stdio.h>

// Function to calculate the Nth Fibonacci number iteratively
long long fibonacci(int n) {
    // Handle the base cases: F(0) = 0 and F(1) = 1
    if (n <= 0) {
        return 0;
    }
    if (n == 1) {
        return 1;
    }

    // Initialize the first two numbers
    long long a = 0; // Represents F(i-2)
    long long b = 1; // Represents F(i-1)
    long long next_fib = 0;

    // Loop from the 2nd number up to the Nth number
    for (int i = 2; i <= n; i++) {
        // The next Fibonacci number is the sum of the previous two
        next_fib = a + b;
        
        // Shift the values for the next iteration:
        // F(i-1) becomes F(i-2) for the next loop (i.e., a = b)
        a = b;
        // F(i) becomes F(i-1) for the next loop (i.e., b = next_fib)
        b = next_fib;
    }

    // After the loop, b holds the Nth Fibonacci number
    return b;
}

int main() {
    int n;
    
    // Get user input
    printf("Enter the Nth number (up to ~92 for long long limit): ");
    
    // Check if input was successful
    if (scanf("%d", &n) != 1) {
        printf("Invalid input.\n");
        return 1;
    }

    if (n < 0) {
        printf("N must be a non-negative integer.\n");
        return 1;
    }

    // Calculate and print the result
    long long result = fibonacci(n);
    printf("The %dth Fibonacci number is: %lld\n", n, result);

    return 0;
}