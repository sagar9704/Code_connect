#include <iostream>
#include <algorithm>
#include <string>

int main() {
std::string str = "dcab";

// Sort the string in ascending order
std::sort(str.begin(), str.end());

std::cout << "Sorted string: " << str << std::endl; // Output: abcd
return 0;
}