#include <stdio.h>
#include <stdbool.h>

bool isPrime(int n) {
    if (n <= 1) return false;
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) return false;
    }
    return true;
}

int main() {
    int number;

    printf("Enter a positive integer: ");
    fflush(stdout);            // <--- ensure prompt appears before waiting for input

    if (scanf("%d", &number) != 1) {
        printf("Invalid input. Please enter an integer.\n");
        return 1;
    }

    if (isPrime(number)) {
        printf("%d is a PRIME number.\n", number);
    } else {
        printf("%d is NOT a prime number.\n", number);
    }
    return 0;
}
