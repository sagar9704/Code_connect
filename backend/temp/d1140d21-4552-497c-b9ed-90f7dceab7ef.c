#include <stdio.h>
#include <stdbool.h> // Required for using the 'bool' data type (true/false)

// Function to check if a number is prime
bool isPrime(int n) {
    // 1 and numbers less than 1 are not prime
    if (n <= 1) {
        return false;
    }
    
    // Check for factors from 2 up to the square root of n
    // We only need to check up to sqrt(n) because if n has a factor larger 
    // than sqrt(n), it must also have a factor smaller than sqrt(n).
    for (int i = 2; i * i <= n; i++) {
        // If n is divisible by i, it's not prime
        if (n % i == 0) {
            return false;
        }
    }
    
    // If no factors were found, the number is prime
    return true;
}

int main() {
    int number;
    
    printf("Enter a positive integer: ");
    
    // Get user input
    if (scanf("%d", &number) != 1) {
        printf("Invalid input. Please enter an integer.\n");
        return 1;
    }

    // Call the function and print the result
    if (isPrime(number)) {
        printf("%d is a PRIME number.\n", number);
    } else {
        printf("%d is NOT a prime number.\n", number);
    }

    return 0;
}