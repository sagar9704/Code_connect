#include <stdio.h>

int main(void) {
    int a, b;
    printf("Enter first number: ");
    if (scanf("%d", &a) != 1) return 0;
    printf("Enter second number: ");
    if (scanf("%d", &b) != 1) return 0;
    printf("Sum = %d\n", a + b);
    return 0;
}
