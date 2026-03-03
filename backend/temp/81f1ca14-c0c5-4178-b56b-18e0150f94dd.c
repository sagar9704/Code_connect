#include <stdio.h>

int main() {
    int number;
    int square;

    // 1. Prompt the user for input
    printf("Enter an integer: ");
    
    // 2. Read the integer from the user
    if (scanf("%d", &number) != 1) {
        printf("Invalid input.\n");
        return 1;
    }

    // 3. Calculate the square
    square = number * number;

    // 4. Print the result
    printf("The square of %d is %d.\n", number, square);

    return 0;
}