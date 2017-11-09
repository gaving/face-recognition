import cx_Oracle
import click
import json

@click.command()
@click.argument('output_folder', default="img/output")
@click.option('--images', default=100, help='Number of images to download')
@click.option('--dataset', default='MPIN', help='Dataset e.g. MPIN, VPIN, CRIM')
def main(output_folder, images, dataset):
    with open('config.json') as data_file:    
        data = json.load(data_file)

    connection = cx_Oracle.connect(data['FETCH_ORACLE_CONNECT'])
    cursor = connection.cursor()
    dict = {
        'images': images,
        'dataset': dataset
    }
    cursor.execute("""
SELECT * 
FROM   (SELECT a.ods_attachment_pk, 
               a.attachment_image 
        FROM   ods_core.attachment a 
               INNER JOIN ods_core.attachment_ref_info i 
                       ON a.source_key = i.source_key 
        WHERE  i.refinfo_type_desc IN ( 'IMAGE/JPEG', 'IMAGE/JPG' ) 
               AND a.source_application = '{dataset}' 
        ORDER  BY dbms_random.value) 
WHERE  ROWNUM <= {images}
    """.format(**dict))

    for row in cursor:
        path = '{0}/{1}.jpg'.format(output_folder, row[0])
        imageFile = open(path,'wb')
        imageFile.write(row[1].read())
        imageFile.close()
        print ("Wrote {0}".format(path))
    
    connection.commit()
    cursor.close()

if __name__ == "__main__":
    main()