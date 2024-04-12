class AddStylesToContents < ActiveRecord::Migration[7.1]
  def change
    add_column :contents, :styles, :json
  end
end
