import java.util.Scanner;
public class PrintInteger {
   public static void main(String args[]){
      Scanner sc = new Scanner(System.in);
      System.out.println("Enter an integer:");
      int num = sc.nextInt();
      System.out.print("Given integer is :: "+num);
   }
}