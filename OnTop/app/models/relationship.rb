class Relationship < ActiveRecord::Base
  attr_accessible :child_id, :parent_id

  belongs_to :parent, :class_name => "Keyword"
  belongs_to :child, :class_name => "Keyword"
end
