export const testList = [

`print("TEST 1")

a = 10
b = 5
c = a + b
d = a - b
e = a * b
f = a / b
g = a % b

print(c)
print(d)
print(e)
print(f)
print(g)
`,

`print("TEST 2")

a = 10
a += 5
print(a)

a -= 3
print(a)

a *= 2
print(a)

a /= 4
print(a)
`,

`print("TEST 3")

a = 50

if(a < 100):
  print("minore di 100")
else:
  print("maggiore o uguale a 100")

if(a >= 50):
  print("maggiore o uguale 50")
`,

`print("TEST 4")

i = 0

while(i < 5):
  print(i)
  i += 1
`,

`print("TEST 5")

for i in range(5):
  print(i)
`,

`print("TEST 6")

for i in range(2, 6):
  print(i)
`,

`print("TEST 7")

a = [10, 20, 30]
print(a[0])
print(a[1])
print(a[2])

a[1] += 5
print(a[1])
`,

`print("TEST 8")

a = [1,2,3,4,5]
print(len(a))
`,

`print("TEST 9")

i = 0

while(i < 10):
  i += 1

  if(i == 3):
    continue

  if(i == 7):
    break

  print(i)
`,

`print("TEST 10")

def saluta():
  print("ciao")

saluta()
`,

`print("TEST 11")

def somma(a, b):
  return a + b

x = somma(5, 7)
print(x)
`,

`print("TEST 12")

def conta(n):
  i = 0
  while(i < n):
    print(i)
    i += 1

conta(3)
`,

`print("TEST FINALE")

def moltiplica(a, b):
  return a * b

numeri = [1,2,3,4,5]

for i in range(len(numeri)):
  risultato = moltiplica(numeri[i], 2)

  if(risultato >= 6):
    print("grande:", risultato)
  else:
    print("piccolo:", risultato)
`

];

export const expected = [

`TEST 1
15
5
50
2
0
`,

`TEST 2
15
12
24
6
`,

`TEST 3
minore di 100
maggiore o uguale 50
`,

`TEST 4
0
1
2
3
4
`,

`TEST 5
0
1
2
3
4
`,

`TEST 6
2
3
4
5
`,

`TEST 7
10
20
30
25
`,

`TEST 8
5
`,

`TEST 9
1
2
4
5
6
`,

`TEST 10
ciao
`,

`TEST 11
12
`,

`TEST 12
0
1
2
`,

`TEST FINALE
piccolo: 2
piccolo: 4
grande: 6
grande: 8
grande: 10
`

];