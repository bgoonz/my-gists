#!/usr/bin/python
# -*- coding: utf-8 -*-
from sys import exit


def begin():
    while True:
        answer = raw_input('Are you ready, %s? Type yes or no: > '% 'name')
        if answer == 'yes' or answer == 'Yes':
            fork()
        elif answer == 'no' or answer == 'No':
            print ( "I'm sorry you feel that way. Try agian when you are ready :")
            quit()
        else:
            print ( 'You must say yes or no.')


def dead(how):
    print ( how, 'Sorry, you died!'
    raw_input('Start over > Press ENTER to continue')
    begin()


def fork():
    print ( """)
_________________________________________________________________________________

Fleeing from the city behind you, you happen upon a fork in the road.
To the left you see mountains in the distance. 
To the right you make out a distant city.
Unable to return home - Which way do you choose, %s? 
_________________________________________________________________________________

""" \
        % name
    while True:

        choice = raw_input('left or right? ')

        if 'eft' in choice:
            mountain_path()
        elif 'ight' in choice:
            city_path()
        else:
            print ( 'That is not Left or Right!!')


def mountain_path():
    print ( """)
_________________________________________________________________________________

You have chosen the path towards the mountains.
Ahead there is a bear! How will you get past it??

Option 1: Attack the bear
Option 2: Run around the bear
Option 3: Run back and go right at the fork
_________________________________________________________________________________
"""

    option = raw_input('What option do you choose, %s? 1, 2, or 3? ')
                       % name)
    if option == '1':
        print ( 'You attack the bear... and somehow manage to win? How did you do that?'
        raw_input('> Press ENTER to continue')
        print ( 'Anyways, Good job! Off to the Mountains!'
        raw_input('> Press ENTER to continue')
        Mountains()
    elif option == '2':
        print ( 'You try and run around the bear...'
        raw_input('> Press ENTER to continue')
        dead('But the bear attacks you.')
    elif option == '3':
        print ( 'You try and run back to the fork in the road...'
        raw_input('> Press ENTER to continue')
        dead('But the bear hears you and attacks you.')
    else:
        print ( 'You stumble around and...'
        raw_input('> Press ENTER to continue')
        dead('The bear attacks you anyways.')


def Mountains():
    print ( """
_________________________________________________________________________________

As you walk up to the mountains a bystander screams in terror because he saw
the future - that future being an avalanche coming down and killing you both.
Interestingly enough, it was that very scream that caused the avalanche in the
first place.
_________________________________________________________________________________
"""
    raw_input('Uh oh!, What should you do %s? > Press ENTER to continue'
              % name)
    print ( 'Option 1: Try and Escape'
    print ( 'Option 2: Fall down and die'
    option = raw_input('1, or 2, %s? ' % name)
    if option == '1':
        print ( "You try and escape but unforunately you can't out run fate."
        raw_input('> Press ENTER to continue')
        dead('The avalanche consumes you.')
    elif option == '2':
        print ( "You're right. There is not hope for you! You fall down and die."
        raw_input('> Press ENTER to continue')
        dead('Yep.')
    else:
        dead('Wront choice...')


def city_path():
    print ( """
_________________________________________________________________________________

You have chosen the path towards the distant city.
Ahead there is a Lion! How will you get past it??

Option 1: Attack the Lion
Option 2: Run around the Lion
Option 3: Run back and go left at the fork
_________________________________________________________________________________
"""

    option = raw_input('What option do you choose, %s? 1, 2, or 3? '
                       % name)
    if option == '1':
        print ( 'You attack the Lion...'
        raw_input('> Press ENTER to continue')
        print ( 'And somehow manage to strik him dead! Good job! Off to the city!'
        raw_input('> Press ENTER to continue')
        city()
    elif option == '2':

        print ( 'You try and run around the lion...'
        raw_input('> Press ENTER to continue')
        dead('But unfortunately you are too slow for the lion and get eaten.'
             )
    elif option == '3':
        print 'You try and run back to the fork in the road...'
        raw_input('> Press ENTER to continue')
        dead('But the Lion hears you and attacks you.')
    else:
        print 'That was the wrong choice...'
        raw_input('> Press ENTER to continue')
        dead('The lion attacks you anyways.')


def city():
    print ( """)



	
_________________________________________________________________________________

Behold! You have made it to our great city! We are all so proud of you!
Sorry about the Lion protecting us. He is there to fend off all those who
are unworthy. But thankfully you are worthy! Here in the great city You can 
have all that you want and will ever need. Enjoy your stay here!


Thanks for trying out my game! It's getting late so I'm going to go to bed! :) 
Be sure to try out other options in this adventure and see what your final outcome
will be. I hope you had fun playing!

- Bryan Guner


_________________________________________________________________________________
"""
    quit(0)


name = raw_input('What is your name, adventurer? ')

age = int(raw_input('How old are you %s? ' % name))
if age > 20 and age < 120:
    print ( '\nGreat! You are old enough to begin.')
    begin()
elif age >= 120:
    print ( "I'm sorry but you are too old to play!")
else:
    print ("I'm sorry. You aren't old enough to play. Goodbye.")
    quit(0)
