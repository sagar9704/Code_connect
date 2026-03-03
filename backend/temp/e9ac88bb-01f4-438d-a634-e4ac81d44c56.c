#include <stdio.h>

int main() {
    int a, b;

    printf("Enter two integers: ");
    // Validate input
    if (scanf("%d %d", &a, &b) != 2) {
        printf("Invalid input. Please enter integers only.\n");
        return 1; // Exit with error
    }

    printf("Sum = %d\n", a + b);
    return 0; // Successful execution
}