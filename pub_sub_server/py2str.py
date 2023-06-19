
file = 'server'
with open(f'/Users/kobe/code/db/pubsub/server_mysql.py') as f:
    with open(f'{file}.txt', 'w') as txt:
        for line in f.readlines():
            line = line.strip('\n')
            line = line.replace("\\", "\\\\")
            line = line.replace("\"", "\\\"")
            txt.write(f'\"{line}\\n\"')
            txt.write('\n')