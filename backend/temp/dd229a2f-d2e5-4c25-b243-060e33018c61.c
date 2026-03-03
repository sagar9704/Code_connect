#include <stdio.h>

int main() {
    int n = 5;

    // Outer loop for printing rows
    for (int i = 1; i <= n; i++) {

        // Inner loop for printing alphabets in each row
        for (int j = 1; j <= i; j++) {
            printf("%c ", 'A' + j - 1);
        }
        printf("\n");
    }

    return 0;
}