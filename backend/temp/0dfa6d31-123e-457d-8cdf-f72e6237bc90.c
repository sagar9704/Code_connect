#include <stdio.h>

int main() {
    int n = 5;

    // Outer loop to iterate through each row
    for (int i = 0; i < n; i++) {

        // First inner loop to print leading whitespaces
        for (int j = 0; j < 2 * (n - i) - 1; j++)
            printf(" ");

        // Second inner loop to print alphabets and inner
        // whitespaces
        for (int k = 0; k < 2 * i + 1; k++) {
            if (k == 0 || k == 2 * i || i == n - 1)
                printf("%c ", k + 'A');
            else
                printf("  ");
        }
        printf("\n");
    }
    return 0;
}