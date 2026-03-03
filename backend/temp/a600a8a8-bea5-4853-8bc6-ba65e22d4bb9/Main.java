import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("Enter a number: ");
        int a = sc.nextInt();

        System.out.print("Enter another number: ");
        int b = sc.nextInt();

        int sum = a + b;

        System.out.println("Sum = " + sum);
    }
}
