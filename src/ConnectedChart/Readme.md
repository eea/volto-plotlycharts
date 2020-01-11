A connected chart that loads its layout and data from an existing
visualization. It then refetches data from the connector url saved in the
visualization. It then filters this data, if needed, based on context data
parameters

This is the most basic building block. All other charts should use this block.
If this block doesn't offer what's needed, extend this one.
